import type { CropConfig, CropRect, ImageDimensions, ImageOutputFormat } from '../types';

const ASPECT_RATIO_TOLERANCE = 0.01;
// Safe browser Canvas dimension cap to prevent OOM on huge images
const MAX_CANVAS_DIMENSION = 8192;

export function loadImageElement(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to decode image file.'));
        img.src = src;
    });
}

export async function getImageDimensions(file: File): Promise<ImageDimensions> {
    const url = URL.createObjectURL(file);
    try {
        const img = await loadImageElement(url);
        return {
            width: img.naturalWidth,
            height: img.naturalHeight,
        };
    } finally {
        URL.revokeObjectURL(url);
    }
}

/**
 * Checks whether a GIF file contains multiple image frames (animated GIF).
 */
export async function isAnimatedGifFile(file: File): Promise<boolean> {
    if (file.type !== 'image/gif' && !file.name.toLowerCase().endsWith('.gif')) {
        return false;
    }
    try {
        // Read up to first 512 KB to look for multiple Graphic Control Extension blocks (0x21 0xF9 0x04)
        const slice = file.slice(0, 512 * 1024);
        const bytes = new Uint8Array(await slice.arrayBuffer());
        let frames = 0;
        for (let i = 0; i < bytes.length - 3; i++) {
            if (bytes[i] === 0x21 && bytes[i + 1] === 0xf9 && bytes[i + 2] === 0x04) {
                frames += 1;
                if (frames > 1) return true;
            }
        }
        return false;
    } catch {
        return false;
    }
}

export function doesAspectRatioMatch(
    dimensions: ImageDimensions,
    targetAspectRatio?: number,
    tolerance = ASPECT_RATIO_TOLERANCE,
): boolean {
    if (!targetAspectRatio || targetAspectRatio <= 0 || dimensions.height <= 0) {
        return true;
    }
    const currentRatio = dimensions.width / dimensions.height;
    return Math.abs(currentRatio - targetAspectRatio) <= tolerance;
}

export function computeCenteredCropRect(
    dimensions: ImageDimensions,
    aspectRatio?: number,
): CropRect {
    const { width: imgW, height: imgH } = dimensions;
    if (!aspectRatio || aspectRatio <= 0) {
        return { x: 0, y: 0, width: imgW, height: imgH };
    }

    const imgRatio = imgW / imgH;
    let cropW: number;
    let cropH: number;

    if (imgRatio > aspectRatio) {
        // Image is wider than target aspect ratio
        cropH = imgH;
        cropW = Math.round(cropH * aspectRatio);
    } else {
        // Image is taller than target aspect ratio
        cropW = imgW;
        cropH = Math.round(cropW / aspectRatio);
    }

    cropW = Math.min(cropW, imgW);
    cropH = Math.min(cropH, imgH);

    return {
        x: Math.round((imgW - cropW) / 2),
        y: Math.round((imgH - cropH) / 2),
        width: cropW,
        height: cropH,
    };
}

export function clampCropRect(
    rect: CropRect,
    dimensions: ImageDimensions,
    minSize = 16,
): CropRect {
    const minW = Math.min(minSize, dimensions.width);
    const minH = Math.min(minSize, dimensions.height);

    const width = Math.max(minW, Math.min(rect.width, dimensions.width));
    const height = Math.max(minH, Math.min(rect.height, dimensions.height));

    const x = Math.max(0, Math.min(rect.x, dimensions.width - width));
    const y = Math.max(0, Math.min(rect.y, dimensions.height - height));

    return {
        x: Math.round(x),
        y: Math.round(y),
        width: Math.round(width),
        height: Math.round(height),
    };
}

export function isFullImageCropRect(
    rect: CropRect,
    dimensions: ImageDimensions,
    tolerance = 2,
): boolean {
    return (
        rect.x <= tolerance &&
        rect.y <= tolerance &&
        Math.abs(rect.width - dimensions.width) <= tolerance * 2 &&
        Math.abs(rect.height - dimensions.height) <= tolerance * 2
    );
}

export function resolveOutputFormat(
    originalFile: File,
    requestedFormat?: ImageOutputFormat,
): ImageOutputFormat {
    if (requestedFormat) return requestedFormat;
    if (originalFile.type === 'image/png') return 'image/png';
    if (originalFile.type === 'image/webp') return 'image/webp';
    return 'image/jpeg';
}

function getExtensionForMime(mime: ImageOutputFormat): string {
    switch (mime) {
        case 'image/png':
            return 'png';
        case 'image/webp':
            return 'webp';
        default:
            return 'jpg';
    }
}

export function buildCroppedFilename(originalName: string, outputFormat: ImageOutputFormat): string {
    const dotIndex = originalName.lastIndexOf('.');
    const baseName = dotIndex > 0 ? originalName.slice(0, dotIndex) : originalName;
    const ext = getExtensionForMime(outputFormat);
    return `${baseName}-cropped.${ext}`;
}

export interface CropImageResult {
    file: File;
    dimensions: ImageDimensions;
    previewUrl: string;
}

/**
 * Generates a new cropped File using HTMLCanvasElement.
 * Respects requested outputFormat and quality without unnecessary resizing.
 */
export async function cropImageFile(
    originalFile: File,
    cropRect: CropRect,
    cropConfig?: Partial<CropConfig>,
): Promise<CropImageResult> {
    const sourceUrl = URL.createObjectURL(originalFile);

    try {
        const img = await loadImageElement(sourceUrl);
        const naturalDims: ImageDimensions = {
            width: img.naturalWidth,
            height: img.naturalHeight,
        };
        const safeRect = clampCropRect(cropRect, naturalDims);

        // Respect browser canvas dimension limits only if crop exceeds MAX_CANVAS_DIMENSION
        let targetW = safeRect.width;
        let targetH = safeRect.height;
        if (targetW > MAX_CANVAS_DIMENSION || targetH > MAX_CANVAS_DIMENSION) {
            const scale = Math.min(MAX_CANVAS_DIMENSION / targetW, MAX_CANVAS_DIMENSION / targetH);
            targetW = Math.round(targetW * scale);
            targetH = Math.round(targetH * scale);
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Canvas 2D context is not available.');
        }

        const outputFormat = resolveOutputFormat(originalFile, cropConfig?.outputFormat);
        const quality = cropConfig?.quality ?? 0.92;

        // Fill white background for JPEG so transparent PNGs don't turn black
        if (outputFormat === 'image/jpeg') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, targetW, targetH);
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(
            img,
            safeRect.x,
            safeRect.y,
            safeRect.width,
            safeRect.height,
            0,
            0,
            targetW,
            targetH,
        );

        const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
                (result) => {
                    if (result) resolve(result);
                    else reject(new Error('Failed to encode cropped image.'));
                },
                outputFormat,
                quality,
            );
        });

        const croppedFile = new File(
            [blob],
            buildCroppedFilename(originalFile.name, outputFormat),
            {
                type: outputFormat,
                lastModified: Date.now(),
            },
        );

        const previewUrl = URL.createObjectURL(croppedFile);

        return {
            file: croppedFile,
            dimensions: { width: targetW, height: targetH },
            previewUrl,
        };
    } finally {
        URL.revokeObjectURL(sourceUrl);
    }
}
