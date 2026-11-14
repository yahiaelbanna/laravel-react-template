export { MediaUploader } from './media-uploader';
export { UploadDropzone } from './components/upload-dropzone';
export { MediaPreview } from './components/media-preview';
export { ImageCropper } from './components/image-cropper';
export { VideoThumbnailDialog } from './components/video-thumbnail';
export { FilePreviewDialog, FilePreviewThumbnail } from './components/file-preview';
export { useMediaUploader } from './hooks/use-media-uploader';

export {
    formatBytes,
    formatDuration,
    toMediaUploaderValue,
    validateFiles,
    verifyFileSignature,
} from './utils/file-validation';
export {
    computeCenteredCropRect,
    cropImageFile,
    doesAspectRatioMatch,
    getImageDimensions,
} from './utils/image-processing';
export { extractVideoThumbnail } from './utils/video-processing';

export type {
    CropConfig,
    CropRect,
    GenericFileMediaItem,
    ImageDimensions,
    ImageMediaItem,
    ImageOutputFormat,
    MediaBaseItem,
    MediaCategory,
    MediaItem,
    MediaUploaderBaseProps,
    MediaUploaderLabels,
    MediaUploaderProps,
    MediaUploaderRef,
    MediaUploaderValue,
    MediaValidationError,
    MultipleMediaUploaderProps,
    SingleMediaUploaderProps,
    UploadContext,
    UploadHandler,
    UploadStatus,
    VideoConfig,
    VideoMediaItem,
} from './types';
