import type * as React from 'react';

export type MediaCategory = 'image' | 'video' | 'file';

export type UploadStatus = 'idle' | 'processing' | 'uploading' | 'success' | 'error';

export type ImageOutputFormat = 'image/jpeg' | 'image/png' | 'image/webp';

export interface ImageDimensions {
    width: number;
    height: number;
}

export interface CropRect {
    /** Normalized or pixel x coordinate relative to original image natural width */
    x: number;
    /** Normalized or pixel y coordinate relative to original image natural height */
    y: number;
    /** Width in natural image pixels */
    width: number;
    /** Height in natural image pixels */
    height: number;
}

export interface CropConfig {
    /** Enable interactive cropping for image items. */
    enabled: boolean;
    /**
     * Target aspect ratio (width / height), e.g. 1, 4/3, 16/9, 3/2, 9/16.
     * Omit or set to `undefined` for free-form aspect ratio.
     */
    aspectRatio?: number;
    /** Output MIME format when a cropped image is generated. Defaults to original format (if JPEG/PNG/WEBP) or 'image/jpeg'. */
    outputFormat?: ImageOutputFormat;
    /** Output compression quality between 0 and 1 for JPEG/WEBP. Defaults to 0.92. */
    quality?: number;
    /** Optional minimum crop width in natural image pixels. */
    minWidth?: number;
    /** Optional minimum crop height in natural image pixels. */
    minHeight?: number;
    /** Allow switching aspect ratio presets inside the crop dialog when aspectRatio is not strictly locked. */
    allowAspectRatioChange?: boolean;
}

export interface VideoConfig {
    /** Enable video handling & thumbnail extraction. Defaults to true. */
    enabled?: boolean;
    /** Automatically extract a thumbnail when a video is added. Defaults to true. */
    generateThumbnail?: boolean;
    /** Default timestamp in seconds for automatic thumbnail extraction. Defaults to 1. */
    thumbnailTimestamp?: number;
    /** Allow the user to scrub the video timeline and pick a frame manually. Defaults to true. */
    allowManualThumbnailSelection?: boolean;
    /** Output MIME format for generated thumbnails. Defaults to 'image/jpeg'. */
    thumbnailFormat?: ImageOutputFormat;
    /** Output quality (0-1) for generated thumbnails. Defaults to 0.88. */
    thumbnailQuality?: number;
}

export interface MediaBaseItem {
    id: string;
    category: MediaCategory;
    /** The active file to be submitted/uploaded (equals `processedFile ?? originalFile`). */
    file: File;
    /** The exact original File selected by the user, never mutated. */
    originalFile: File;
    /** The processed File (e.g. cropped image) when processing was applied, otherwise null. */
    processedFile: File | null;
    name: string;
    size: number;
    mimeType: string;
    extension: string;
    status: UploadStatus;
    /** Network upload progress (0-100). */
    progress: number;
    /** Processing message when status === 'processing'. */
    processingLabel?: string;
    error?: string;
    /** Remote response returned by uploadHandler on success. */
    uploadResponse?: unknown;
}

export interface ImageMediaItem extends MediaBaseItem {
    category: 'image';
    /** Object URL of the active file (processed or original). */
    previewUrl: string;
    /** Object URL of the original uncropped file. */
    originalPreviewUrl: string;
    originalDimensions: ImageDimensions | null;
    dimensions: ImageDimensions | null;
    /** Crop rectangle in natural image pixels if cropped or initialized for aspect ratio. */
    cropRect: CropRect | null;
    /** True if the user or aspect-ratio enforcement actually produced a cropped file. */
    isCropped: boolean;
    /** True when the image is an animated GIF (preserved when cropping is disabled or skipped). */
    isAnimatedGif?: boolean;
}

export interface VideoMediaItem extends MediaBaseItem {
    category: 'video';
    /** Object URL of the video file for playback preview. */
    previewUrl: string;
    /** Generated thumbnail File associated with this video. */
    thumbnail: File | null;
    /** Object URL of the generated thumbnail. */
    thumbnailPreview: string | null;
    /** Timestamp in seconds from which the current thumbnail was extracted. */
    thumbnailTimestamp: number;
    duration: number | null;
    dimensions: ImageDimensions | null;
}

export interface GenericFileMediaItem extends MediaBaseItem {
    category: 'file';
    /** Object URL for previewable formats like PDF. */
    previewUrl: string | null;
}

export type MediaItem = ImageMediaItem | VideoMediaItem | GenericFileMediaItem;

/**
 * Structured submission payload for forms & APIs.
 */
export interface MediaUploaderValue {
    images: File[];
    videos: {
        file: File;
        thumbnail: File | null;
    }[];
    files: File[];
}

export interface UploadContext {
    item: MediaItem;
    signal: AbortSignal;
    /** Present when uploading a video's associated thumbnail. */
    isThumbnail?: boolean;
}

export interface UploadHandler {
    (file: File, onProgress: (progress: number) => void, context: UploadContext): Promise<unknown>;
}

export interface MediaValidationError {
    file: File;
    code: 'invalid-type' | 'file-too-large' | 'too-many-files' | 'duplicate-file' | 'corrupt-file';
    message: string;
}

export interface MediaUploaderLabels {
    dropzoneTitle?: string;
    dropzoneDescription?: string;
    browseButton?: string;
    replaceLabel?: string;
    removeLabel?: string;
    cropLabel?: string;
    selectFrameLabel?: string;
    regenerateThumbnailLabel?: string;
    uploadAllLabel?: string;
    retryLabel?: string;
    emptyState?: React.ReactNode;
}

export interface MediaUploaderRef {
    /** Trigger upload for all idle/error items. */
    uploadAll: () => Promise<void>;
    /** Trigger upload for a single item by id. */
    uploadItem: (id: string) => Promise<void>;
    /** Clear all items and revoke object URLs. */
    clear: () => void;
    /** Open the native file picker. */
    openFilePicker: () => void;
    /** Get the structured submission payload. */
    getSubmissionValue: () => MediaUploaderValue;
}

export interface MediaUploaderBaseProps {
    /** Accepted file types (HTML accept string, e.g. "image/*,video/*,.pdf"). */
    accept?: string;
    /** Maximum file size in bytes per file. */
    maxSize?: number;
    /** Prevent selecting the same file (name + size + lastModified) twice. Defaults to true. */
    preventDuplicates?: boolean;
    /** Image cropping configuration. */
    crop?: CropConfig;
    /** Video handling & thumbnail configuration. */
    video?: VideoConfig;
    /** Optional upload handler that reports actual network progress (0-100). */
    uploadHandler?: UploadHandler;
    /** Automatically start uploading when files are ready. Defaults to false. */
    autoUpload?: boolean;
    /** Maximum concurrent uploads (1 = sequential). Defaults to 3. */
    uploadConcurrency?: number;
    /** Disable all interactions. */
    disabled?: boolean;
    /** Read-only mode: previews remain viewable, but adding/editing/removing is disabled. */
    readOnly?: boolean;
    /** Custom labels & empty state. */
    labels?: MediaUploaderLabels;
    /** Validation error callback. */
    onValidationError?: (errors: MediaValidationError[]) => void;
    /** Callback fired when an item is removed. */
    onRemove?: (item: MediaItem) => void;
    /** Callback fired when an upload completes. */
    onUploadComplete?: (item: MediaItem, response: unknown) => void;
    /** Callback fired when an upload fails. */
    onUploadError?: (item: MediaItem, error: Error) => void;
    /** Optional className for root container. */
    className?: string;
    /** Optional id for the file input (useful for label htmlFor). */
    id?: string;
    /** Optional aria-invalid for form validation styling. */
    'aria-invalid'?: boolean;
}

export interface SingleMediaUploaderProps extends MediaUploaderBaseProps {
    multiple?: false;
    maxFiles?: 1;
    value?: MediaItem | null;
    defaultValue?: MediaItem | null;
    onChange?: (value: MediaItem | null, submission: MediaUploaderValue) => void;
}

export interface MultipleMediaUploaderProps extends MediaUploaderBaseProps {
    multiple: true;
    maxFiles?: number;
    value?: MediaItem[];
    defaultValue?: MediaItem[];
    onChange?: (value: MediaItem[], submission: MediaUploaderValue) => void;
}

export type MediaUploaderProps = SingleMediaUploaderProps | MultipleMediaUploaderProps;
