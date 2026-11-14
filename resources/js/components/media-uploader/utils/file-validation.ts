import type { MediaCategory, MediaItem, MediaUploaderValue, MediaValidationError } from '../types';

const EXTENSION_MIME_MAP: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    avif: 'image/avif',
    bmp: 'image/bmp',
    mp4: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
    m4v: 'video/x-m4v',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    csv: 'text/csv',
    txt: 'text/plain',
    zip: 'application/zip',
};

export function createMediaId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return `media-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getFileExtension(filename: string): string {
    const idx = filename.lastIndexOf('.');
    if (idx <= 0 || idx === filename.length - 1) return '';
    return filename.slice(idx + 1).toLowerCase();
}

export function inferMimeType(file: File): string {
    if (file.type && file.type.trim().length > 0) {
        return file.type.toLowerCase();
    }
    const ext = getFileExtension(file.name);
    return EXTENSION_MIME_MAP[ext] ?? 'application/octet-stream';
}

export function detectMediaCategory(file: File): MediaCategory {
    const mime = inferMimeType(file);
    if (mime.startsWith('image/')) return 'image';
    if (mime.startsWith('video/')) return 'video';
    return 'file';
}

export function formatBytes(bytes: number, decimals = 1): string {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDuration(seconds: number | null | undefined): string {
    if (seconds === null || seconds === undefined || !Number.isFinite(seconds) || seconds < 0) {
        return '0:00';
    }
    const totalSeconds = Math.floor(seconds);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) {
        return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${mins}:${String(secs).padStart(2, '0')}`;
}

/**
 * Inspects the magic bytes of a File header to verify known binary formats
 * rather than trusting file extension or reported MIME type alone.
 */
export async function verifyFileSignature(file: File): Promise<{ valid: boolean; detectedMime?: string }> {
    if (file.size === 0) {
        return { valid: false };
    }

    const mime = inferMimeType(file);
    // Plain text / CSV / SVG do not have fixed binary magic bytes
    if (mime === 'text/plain' || mime === 'text/csv' || mime === 'image/svg+xml' || mime === 'application/msword' || mime === 'application/vnd.ms-excel') {
        return { valid: true };
    }

    try {
        const headerBuffer = await file.slice(0, 16).arrayBuffer();
        const bytes = new Uint8Array(headerBuffer);

        const startsWith = (sig: number[], offset = 0) =>
            sig.every((b, idx) => bytes[offset + idx] === b);

        // JPEG: FF D8 FF
        if (startsWith([0xff, 0xd8, 0xff])) {
            return { valid: mime.startsWith('image/'), detectedMime: 'image/jpeg' };
        }
        // PNG: 89 50 4E 47 0D 0A 1A 0A
        if (startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
            return { valid: mime.startsWith('image/'), detectedMime: 'image/png' };
        }
        // GIF: GIF87a or GIF89a
        if (startsWith([0x47, 0x49, 0x46, 0x38, 0x37, 0x61]) || startsWith([0x47, 0x49, 0x46, 0x38, 0x39, 0x61])) {
            return { valid: mime.startsWith('image/'), detectedMime: 'image/gif' };
        }
        // WEBP: RIFF....WEBP
        if (startsWith([0x52, 0x49, 0x46, 0x46]) && startsWith([0x57, 0x45, 0x42, 0x50], 8)) {
            return { valid: mime.startsWith('image/'), detectedMime: 'image/webp' };
        }
        // PDF: %PDF-
        if (startsWith([0x25, 0x50, 0x44, 0x46, 0x2d])) {
            return { valid: mime === 'application/pdf', detectedMime: 'application/pdf' };
        }
        // ZIP / DOCX / XLSX: PK\x03\x04 or PK\x05\x06
        if (startsWith([0x50, 0x4b, 0x03, 0x04]) || startsWith([0x50, 0x4b, 0x05, 0x06])) {
            const isZipFamily =
                mime === 'application/zip' ||
                mime === 'application/x-zip-compressed' ||
                mime.includes('openxmlformats-officedocument');
            return { valid: isZipFamily, detectedMime: mime };
        }
        // MP4 / MOV: ....ftyp
        if (startsWith([0x66, 0x74, 0x79, 0x70], 4)) {
            return { valid: mime.startsWith('video/'), detectedMime: mime };
        }
        // WEBM / Matroska: 1A 45 DF A3
        if (startsWith([0x1a, 0x45, 0xdf, 0xa3])) {
            return { valid: mime.startsWith('video/'), detectedMime: 'video/webm' };
        }

        // For other formats (e.g. AVIF, BMP, custom types), require a non-empty MIME type
        if (
            mime === 'image/jpeg' ||
            mime === 'image/png' ||
            mime === 'image/gif' ||
            mime === 'image/webp' ||
            mime === 'application/pdf'
        ) {
            // Known binary type failed its expected magic-byte check
            return { valid: false };
        }

        return { valid: true };
    } catch {
        return { valid: false };
    }
}

export function matchesAccept(file: File, accept?: string): boolean {
    if (!accept || accept.trim() === '' || accept.trim() === '*') return true;

    const acceptedTokens = accept
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

    if (acceptedTokens.length === 0) return true;

    const fileMime = inferMimeType(file);
    const fileExt = `.${getFileExtension(file.name)}`;

    return acceptedTokens.some((token) => {
        if (token === '*/*') return true;
        if (token.startsWith('.')) {
            return fileExt === token;
        }
        if (token.endsWith('/*')) {
            const prefix = token.slice(0, -1); // e.g. "image/"
            return fileMime.startsWith(prefix);
        }
        return fileMime === token;
    });
}

export function isDuplicateFile(file: File, existingItems: MediaItem[]): boolean {
    return existingItems.some(
        (item) =>
            item.originalFile.name === file.name &&
            item.originalFile.size === file.size &&
            item.originalFile.lastModified === file.lastModified,
    );
}

export interface ValidateFilesOptions {
    files: File[];
    existingItems: MediaItem[];
    accept?: string;
    maxSize?: number;
    maxFiles?: number;
    multiple?: boolean;
    preventDuplicates?: boolean;
}

export async function validateFiles({
    files,
    existingItems,
    accept,
    maxSize,
    maxFiles,
    multiple = false,
    preventDuplicates = true,
}: ValidateFilesOptions): Promise<{ validFiles: File[]; errors: MediaValidationError[] }> {
    const validFiles: File[] = [];
    const errors: MediaValidationError[] = [];

    const effectiveMaxFiles = multiple ? maxFiles : 1;
    let remainingSlots =
        effectiveMaxFiles !== undefined
            ? multiple
                ? Math.max(0, effectiveMaxFiles - existingItems.length)
                : 1
            : Infinity;

    for (const file of files) {
        if (remainingSlots <= 0) {
            errors.push({
                file,
                code: 'too-many-files',
                message: `Maximum of ${effectiveMaxFiles} file${effectiveMaxFiles === 1 ? '' : 's'} allowed.`,
            });
            continue;
        }

        if (!matchesAccept(file, accept)) {
            errors.push({
                file,
                code: 'invalid-type',
                message: `"${file.name}" is not an accepted file type.`,
            });
            continue;
        }

        if (maxSize !== undefined && file.size > maxSize) {
            errors.push({
                file,
                code: 'file-too-large',
                message: `"${file.name}" (${formatBytes(file.size)}) exceeds the ${formatBytes(maxSize)} limit.`,
            });
            continue;
        }

        if (preventDuplicates && isDuplicateFile(file, existingItems)) {
            errors.push({
                file,
                code: 'duplicate-file',
                message: `"${file.name}" has already been selected.`,
            });
            continue;
        }

        const signature = await verifyFileSignature(file);
        if (!signature.valid) {
            errors.push({
                file,
                code: 'corrupt-file',
                message: `"${file.name}" appears to be empty, corrupted, or does not match its file type.`,
            });
            continue;
        }

        validFiles.push(file);
        remainingSlots -= 1;
    }

    return { validFiles, errors };
}

export function toMediaUploaderValue(items: MediaItem[]): MediaUploaderValue {
    const images: File[] = [];
    const videos: { file: File; thumbnail: File | null }[] = [];
    const files: File[] = [];

    for (const item of items) {
        if (item.category === 'image') {
            images.push(item.file);
        } else if (item.category === 'video') {
            videos.push({
                file: item.file,
                thumbnail: item.thumbnail,
            });
        } else {
            files.push(item.file);
        }
    }

    return { images, videos, files };
}
