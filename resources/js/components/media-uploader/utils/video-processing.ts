import type { ImageDimensions, ImageOutputFormat } from '../types';

export interface ExtractVideoThumbnailOptions {
    timestamp?: number;
    format?: ImageOutputFormat;
    quality?: number;
    signal?: AbortSignal;
}

export interface VideoMetadataResult {
    duration: number | null;
    dimensions: ImageDimensions | null;
}

export interface ExtractedThumbnailResult {
    thumbnail: File;
    thumbnailPreview: string;
    timestamp: number;
    duration: number | null;
    dimensions: ImageDimensions | null;
}

function buildThumbnailFilename(videoName: string, format: ImageOutputFormat): string {
    const dotIdx = videoName.lastIndexOf('.');
    const base = dotIdx > 0 ? videoName.slice(0, dotIdx) : videoName;
    const ext = format === 'image/png' ? 'png' : format === 'image/webp' ? 'webp' : 'jpg';
    return `${base}-thumbnail.${ext}`;
}

function cleanupVideoElement(video: HTMLVideoElement, objectUrl: string): void {
    try {
        video.pause();
        video.removeAttribute('src');
        video.load();
    } catch {
        // Ignore cleanup errors
    }
    URL.revokeObjectURL(objectUrl);
}

/**
 * Extracts video metadata and a single frame at the requested timestamp as a File + preview URL.
 * Cleans up all DOM elements, event listeners, and temporary object URLs.
 */
export async function extractVideoThumbnail(
    videoFile: File,
    options: ExtractVideoThumbnailOptions = {},
): Promise<ExtractedThumbnailResult> {
    const {
        timestamp = 1,
        format = 'image/jpeg',
        quality = 0.88,
        signal,
    } = options;

    if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError');
    }

    const objectUrl = URL.createObjectURL(videoFile);
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';

    return new Promise<ExtractedThumbnailResult>((resolve, reject) => {
        let settled = false;
        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        const finish = (fn: () => void) => {
            if (settled) return;
            settled = true;
            if (timeoutId !== null) clearTimeout(timeoutId);
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('loadeddata', onLoadedData);
            video.removeEventListener('seeked', onSeeked);
            video.removeEventListener('error', onError);
            signal?.removeEventListener('abort', onAbort);
            cleanupVideoElement(video, objectUrl);
            fn();
        };

        const onAbort = () => {
            finish(() => reject(new DOMException('Aborted', 'AbortError')));
        };

        const onError = () => {
            finish(() =>
                reject(
                    new Error(
                        'Unable to decode this video format in the browser. The video file is still preserved.',
                    ),
                ),
            );
        };

        let targetTime = Math.max(0, timestamp);

        const onLoadedMetadata = () => {
            const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : null;
            if (duration !== null) {
                // Clamp slightly before the exact end so the decoder has a valid frame
                const maxSeek = Math.max(0, duration - 0.05);
                targetTime = Math.min(Math.max(0, timestamp), maxSeek);
            } else {
                targetTime = 0;
            }
        };

        const captureFrame = () => {
            try {
                const width = video.videoWidth;
                const height = video.videoHeight;

                if (!width || !height) {
                    finish(() =>
                        reject(new Error('Video has no decodable visual track.')),
                    );
                    return;
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    finish(() => reject(new Error('Canvas 2D context is not available.')));
                    return;
                }

                ctx.drawImage(video, 0, 0, width, height);

                const duration =
                    Number.isFinite(video.duration) && video.duration > 0 ? video.duration : null;
                const dimensions: ImageDimensions = { width, height };

                canvas.toBlob(
                    (blob) => {
                        if (settled) return;
                        if (!blob) {
                            finish(() =>
                                reject(new Error('Failed to encode video thumbnail.')),
                            );
                            return;
                        }
                        const thumbnail = new File(
                            [blob],
                            buildThumbnailFilename(videoFile.name, format),
                            { type: format, lastModified: Date.now() },
                        );
                        const thumbnailPreview = URL.createObjectURL(thumbnail);
                        finish(() =>
                            resolve({
                                thumbnail,
                                thumbnailPreview,
                                timestamp: targetTime,
                                duration,
                                dimensions,
                            }),
                        );
                    },
                    format,
                    quality,
                );
            } catch (err) {
                finish(() =>
                    reject(err instanceof Error ? err : new Error('Failed to capture video frame.')),
                );
            }
        };

        const onLoadedData = () => {
            if (signal?.aborted) {
                onAbort();
                return;
            }
            // Seek to targetTime; if already at 0 and targetTime is 0, capture directly
            if (Math.abs(video.currentTime - targetTime) < 0.01) {
                captureFrame();
            } else {
                video.currentTime = targetTime;
            }
        };

        const onSeeked = () => {
            if (signal?.aborted) {
                onAbort();
                return;
            }
            captureFrame();
        };

        // Guard against stalled/unsupported codecs that never fire error or loadeddata
        timeoutId = setTimeout(() => {
            finish(() =>
                reject(
                    new Error(
                        'Timed out while decoding video for thumbnail extraction.',
                    ),
                ),
            );
        }, 15000);

        signal?.addEventListener('abort', onAbort, { once: true });
        video.addEventListener('loadedmetadata', onLoadedMetadata);
        video.addEventListener('loadeddata', onLoadedData);
        video.addEventListener('seeked', onSeeked);
        video.addEventListener('error', onError);

        video.src = objectUrl;
        video.load();
    });
}
