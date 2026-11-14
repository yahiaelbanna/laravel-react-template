import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MediaUploader } from './media-uploader';
import type { MediaItem, MediaUploaderRef, MediaUploaderValue, UploadHandler } from './types';

/**
 * Example XHR upload adapter reporting real upload progress (0-100).
 * Never simulates progress; uses XMLHttpRequest.upload.onprogress.
 */
export function createXhrUploadHandler(endpoint: string): UploadHandler {
    return (file, onProgress, { item, signal }) =>
        new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const formData = new FormData();
            formData.append('file', file);

            if (item.category === 'video' && item.thumbnail) {
                formData.append('thumbnail', item.thumbnail);
            }

            const onAbort = () => xhr.abort();
            signal.addEventListener('abort', onAbort, { once: true });

            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable && event.total > 0) {
                    onProgress((event.loaded / event.total) * 100);
                }
            });

            xhr.addEventListener('load', () => {
                signal.removeEventListener('abort', onAbort);
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        resolve(JSON.parse(xhr.responseText));
                    } catch {
                        resolve(xhr.responseText);
                    }
                } else {
                    reject(new Error(`Upload failed with status ${xhr.status}`));
                }
            });

            xhr.addEventListener('error', () => {
                signal.removeEventListener('abort', onAbort);
                reject(new Error('Network error during upload.'));
            });

            xhr.addEventListener('abort', () => {
                signal.removeEventListener('abort', onAbort);
                reject(new DOMException('Upload aborted', 'AbortError'));
            });

            xhr.open('POST', endpoint);
            xhr.send(formData);
        });
}

export function MediaUploaderExamples() {
    const [avatar, setAvatar] = React.useState<MediaItem | null>(null);
    const [banner, setBanner] = React.useState<MediaItem | null>(null);
    const [gallery, setGallery] = React.useState<MediaItem[]>([]);
    const [videos, setVideos] = React.useState<MediaItem[]>([]);
    const [documents, setDocuments] = React.useState<MediaItem[]>([]);
    const [mixed, setMixed] = React.useState<MediaItem[]>([]);
    const [submissionPreview, setSubmissionPreview] = React.useState<MediaUploaderValue | null>(null);

    const mixedUploaderRef = React.useRef<MediaUploaderRef>(null);
    const xhrUploadHandler = React.useMemo(() => createXhrUploadHandler('/api/media'), []);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mixedUploaderRef.current) {
            setSubmissionPreview(mixedUploaderRef.current.getSubmissionValue());
        }
    };

    return (
        <div className="mx-auto max-w-5xl space-y-6 p-6">
            {/* 1. Single image without cropping */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">1. Single Image (No Cropping)</CardTitle>
                    <CardDescription>
                        Preserves original file, dimensions, and animated GIFs without re-encoding.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <MediaUploader
                        accept="image/*"
                        maxSize={5 * 1024 * 1024}
                        value={avatar}
                        onChange={(val) => setAvatar(val)}
                    />
                </CardContent>
            </Card>

            {/* 2. Single image with fixed 16:9 aspect ratio */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">2. Single Image with 16:9 Crop</CardTitle>
                    <CardDescription>
                        Displays the full original image first; enforces 16:9 when cropping is applied.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <MediaUploader
                        accept="image/jpeg,image/png,image/webp"
                        maxSize={10 * 1024 * 1024}
                        value={banner}
                        onChange={(val) => setBanner(val)}
                        crop={{
                            enabled: true,
                            aspectRatio: 16 / 9,
                            outputFormat: 'image/jpeg',
                            quality: 0.9,
                        }}
                    />
                </CardContent>
            </Card>

            {/* 3. Multiple images with flexible cropping */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">3. Multiple Images with Interactive Cropping</CardTitle>
                    <CardDescription>
                        Independent per-image crop state with preset & free aspect ratios.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <MediaUploader
                        multiple
                        maxFiles={6}
                        accept="image/*"
                        maxSize={10 * 1024 * 1024}
                        value={gallery}
                        onChange={(val) => setGallery(val)}
                        crop={{
                            enabled: true,
                            allowAspectRatioChange: true,
                            quality: 0.92,
                        }}
                    />
                </CardContent>
            </Card>

            {/* 4. Multiple videos with automatic & manual thumbnails */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">4. Multiple Videos with Thumbnail Extraction</CardTitle>
                    <CardDescription>
                        Automatically extracts a frame at 1s and allows manual timeline frame selection.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <MediaUploader
                        multiple
                        maxFiles={4}
                        accept="video/mp4,video/webm,video/quicktime"
                        maxSize={100 * 1024 * 1024}
                        value={videos}
                        onChange={(val) => setVideos(val)}
                        video={{
                            enabled: true,
                            generateThumbnail: true,
                            thumbnailTimestamp: 1,
                            allowManualThumbnailSelection: true,
                        }}
                    />
                </CardContent>
            </Card>

            {/* 5. Generic file uploads */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">5. Generic Documents & Archives</CardTitle>
                    <CardDescription>
                        Supports PDF, DOCX, XLSX, CSV, TXT, and ZIP with inline PDF/text preview.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <MediaUploader
                        multiple
                        maxFiles={10}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip"
                        maxSize={20 * 1024 * 1024}
                        value={documents}
                        onChange={(val) => setDocuments(val)}
                    />
                </CardContent>
            </Card>

            {/* 6. Mixed media + form submission */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">6. Mixed Media + Form Submission & Upload Adapter</CardTitle>
                    <CardDescription>
                        Combines images, videos, and files with an XHR upload handler and structured submission payload.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        <MediaUploader
                            ref={mixedUploaderRef}
                            multiple
                            maxFiles={10}
                            accept="image/*,video/*,.pdf,.docx,.xlsx,.csv,.txt,.zip"
                            maxSize={50 * 1024 * 1024}
                            value={mixed}
                            onChange={(val) => setMixed(val)}
                            crop={{ enabled: true, allowAspectRatioChange: true }}
                            video={{ enabled: true, generateThumbnail: true, thumbnailTimestamp: 1 }}
                            uploadHandler={xhrUploadHandler}
                            autoUpload={false}
                        />
                        <div className="flex items-center gap-2">
                            <Button type="submit" size="sm">
                                Prepare Submission Payload
                            </Button>
                        </div>
                    </form>

                    {submissionPreview && (
                        <pre className="mt-4 overflow-auto rounded-md border bg-muted/30 p-3 text-xs">
                            {JSON.stringify(
                                {
                                    images: submissionPreview.images.map((f) => f.name),
                                    videos: submissionPreview.videos.map((v) => ({
                                        file: v.file.name,
                                        thumbnail: v.thumbnail?.name ?? null,
                                    })),
                                    files: submissionPreview.files.map((f) => f.name),
                                },
                                null,
                                2,
                            )}
                        </pre>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
