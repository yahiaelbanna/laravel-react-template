import * as React from 'react';
import { AlertCircle, Trash2, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FilePreviewDialog } from './components/file-preview';
import { ImageCropper } from './components/image-cropper';
import { MediaPreview } from './components/media-preview';
import { UploadDropzone } from './components/upload-dropzone';
import { VideoThumbnailDialog } from './components/video-thumbnail';
import { useMediaUploader } from './hooks/use-media-uploader';
import type {
    GenericFileMediaItem,
    ImageMediaItem,
    MediaUploaderProps,
    MediaUploaderRef,
    MediaValidationError,
    VideoMediaItem,
} from './types';

export const MediaUploader = React.forwardRef<MediaUploaderRef, MediaUploaderProps>(
    function MediaUploader(props, ref) {
        const {
            accept,
            maxSize,
            preventDuplicates = true,
            crop,
            video,
            uploadHandler,
            autoUpload = false,
            uploadConcurrency = 3,
            disabled = false,
            readOnly = false,
            labels,
            onValidationError,
            onRemove,
            onUploadComplete,
            onUploadError,
            className,
            id,
            'aria-invalid': ariaInvalid,
        } = props;

        const multiple = props.multiple === true;
        const maxFiles = multiple ? props.maxFiles : 1;

        const fileInputRef = React.useRef<HTMLInputElement>(null);
        const [validationErrors, setValidationErrors] = React.useState<MediaValidationError[]>([]);
        const [cropTargetId, setCropTargetId] = React.useState<string | null>(null);
        const [videoTargetId, setVideoTargetId] = React.useState<string | null>(null);
        const [filePreviewTargetId, setFilePreviewTargetId] = React.useState<string | null>(null);

        const handleValidationError = React.useCallback(
            (errors: MediaValidationError[]) => {
                setValidationErrors(errors);
                onValidationError?.(errors);
            },
            [onValidationError],
        );

        const uploader = useMediaUploader({
            multiple,
            maxFiles,
            maxSize,
            accept,
            preventDuplicates,
            crop,
            video,
            uploadHandler,
            autoUpload,
            uploadConcurrency,
            value: props.value,
            defaultValue: props.defaultValue,
            onChange: props.onChange,
            onValidationError: handleValidationError,
            onRemove,
            onUploadComplete,
            onUploadError,
        });

        React.useImperativeHandle(
            ref,
            () => ({
                uploadAll: uploader.uploadAll,
                uploadItem: uploader.uploadItem,
                clear: uploader.clear,
                openFilePicker: () => fileInputRef.current?.click(),
                getSubmissionValue: uploader.getSubmissionValue,
            }),
            [uploader],
        );

        const handleFilesSelected = React.useCallback(
            (files: File[]) => {
                setValidationErrors([]);
                void uploader.addFiles(files);
            },
            [uploader],
        );

        const cropTarget = React.useMemo(
            () =>
                (uploader.items.find(
                    (it) => it.id === cropTargetId && it.category === 'image',
                ) as ImageMediaItem | undefined) ?? null,
            [cropTargetId, uploader.items],
        );

        const videoTarget = React.useMemo(
            () =>
                (uploader.items.find(
                    (it) => it.id === videoTargetId && it.category === 'video',
                ) as VideoMediaItem | undefined) ?? null,
            [uploader.items, videoTargetId],
        );

        const filePreviewTarget = React.useMemo(
            () =>
                (uploader.items.find(
                    (it) => it.id === filePreviewTargetId && it.category === 'file',
                ) as GenericFileMediaItem | undefined) ?? null,
            [filePreviewTargetId, uploader.items],
        );

        const isInteractive = !disabled && !readOnly;
        const hasPendingUploads = uploader.items.some(
            (it) => it.status === 'idle' || it.status === 'error',
        );

        return (
            <div className={cn('space-y-4', className)}>
                {!readOnly && (
                    <UploadDropzone
                        inputId={id}
                        inputRef={fileInputRef}
                        accept={accept}
                        multiple={multiple}
                        maxSize={maxSize}
                        maxFiles={maxFiles}
                        currentCount={uploader.items.length}
                        disabled={disabled}
                        readOnly={readOnly}
                        hasError={Boolean(ariaInvalid) || validationErrors.length > 0}
                        title={labels?.dropzoneTitle}
                        description={labels?.dropzoneDescription}
                        browseLabel={labels?.browseButton}
                        emptyState={labels?.emptyState}
                        onFilesSelected={handleFilesSelected}
                    />
                )}

                {validationErrors.length > 0 && (
                    <Alert variant="destructive" className="relative pr-10">
                        <AlertCircle className="size-4" />
                        <AlertTitle className="text-xs font-medium">
                            Some files could not be added
                        </AlertTitle>
                        <AlertDescription>
                            <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs">
                                {validationErrors.map((err, idx) => (
                                    <li key={`${err.file.name}-${idx}`}>{err.message}</li>
                                ))}
                            </ul>
                        </AlertDescription>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 size-6 text-destructive hover:bg-destructive/10"
                            onClick={() => setValidationErrors([])}
                            aria-label="Dismiss validation errors"
                        >
                            <X className="size-3.5" />
                        </Button>
                    </Alert>
                )}

                {uploader.items.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-xs text-muted-foreground">
                                {uploader.items.length} file
                                {uploader.items.length === 1 ? '' : 's'} selected
                                {multiple && maxFiles ? ` (max ${maxFiles})` : ''}
                            </p>

                            {isInteractive && (
                                <div className="flex items-center gap-2">
                                    {uploadHandler && hasPendingUploads && (
                                        <Button
                                            type="button"
                                            size="sm"
                                            className="h-7 px-2.5 text-xs"
                                            onClick={() => void uploader.uploadAll()}
                                        >
                                            <Upload className="mr-1.5 size-3.5" />
                                            {labels?.uploadAllLabel ?? 'Upload all'}
                                        </Button>
                                    )}
                                    {multiple && uploader.items.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                                            onClick={uploader.clear}
                                        >
                                            <Trash2 className="mr-1 size-3.5" />
                                            Clear all
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>

                        <div
                            className={cn(
                                'grid gap-3',
                                multiple
                                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                                    : 'grid-cols-1',
                            )}
                        >
                            {uploader.items.map((item) => (
                                <MediaPreview
                                    key={item.id}
                                    item={item}
                                    accept={accept}
                                    crop={crop}
                                    video={video}
                                    hasUploadHandler={Boolean(uploadHandler)}
                                    disabled={disabled}
                                    readOnly={readOnly}
                                    labels={labels}
                                    onRemove={uploader.removeItem}
                                    onReplace={(itemId, file) =>
                                        void uploader.replaceItem(itemId, file)
                                    }
                                    onOpenCropper={(imgItem) => setCropTargetId(imgItem.id)}
                                    onResetCrop={uploader.resetImageCrop}
                                    onOpenVideoFramePicker={(vidItem) =>
                                        setVideoTargetId(vidItem.id)
                                    }
                                    onRegenerateThumbnail={(vidId) =>
                                        void uploader.regenerateVideoThumbnail(vidId)
                                    }
                                    onOpenFilePreview={(fileItem) =>
                                        setFilePreviewTargetId(fileItem.id)
                                    }
                                    onUploadItem={(itemId) => void uploader.uploadItem(itemId)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <ImageCropper
                    item={cropTarget}
                    open={Boolean(cropTarget)}
                    cropConfig={crop}
                    onOpenChange={(open) => {
                        if (!open) setCropTargetId(null);
                    }}
                    onApply={(itemId, rect, hasModified) =>
                        void uploader.applyImageCrop(itemId, rect, hasModified)
                    }
                    onResetToOriginal={uploader.resetImageCrop}
                />

                <VideoThumbnailDialog
                    item={videoTarget}
                    open={Boolean(videoTarget)}
                    onOpenChange={(open) => {
                        if (!open) setVideoTargetId(null);
                    }}
                    onCaptureFrame={(itemId, ts) =>
                        uploader.regenerateVideoThumbnail(itemId, ts)
                    }
                />

                <FilePreviewDialog
                    item={filePreviewTarget}
                    open={Boolean(filePreviewTarget)}
                    onOpenChange={(open) => {
                        if (!open) setFilePreviewTargetId(null);
                    }}
                />
            </div>
        );
    },
);

MediaUploader.displayName = 'MediaUploader';
