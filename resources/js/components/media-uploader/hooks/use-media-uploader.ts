import * as React from 'react';
import type {
    CropConfig,
    CropRect,
    ImageMediaItem,
    MediaItem,
    MediaUploaderValue,
    MediaValidationError,
    UploadHandler,
    VideoConfig,
    VideoMediaItem,
} from '../types';
import {
    createMediaId,
    detectMediaCategory,
    getFileExtension,
    inferMimeType,
    toMediaUploaderValue,
    validateFiles,
} from '../utils/file-validation';
import {
    cropImageFile,
    doesAspectRatioMatch,
    getImageDimensions,
    isAnimatedGifFile,
    isFullImageCropRect,
} from '../utils/image-processing';
import { extractVideoThumbnail } from '../utils/video-processing';

export interface UseMediaUploaderOptions {
    multiple?: boolean;
    maxFiles?: number;
    maxSize?: number;
    accept?: string;
    preventDuplicates?: boolean;
    crop?: CropConfig;
    video?: VideoConfig;
    uploadHandler?: UploadHandler;
    autoUpload?: boolean;
    uploadConcurrency?: number;
    value?: MediaItem[] | MediaItem | null;
    defaultValue?: MediaItem[] | MediaItem | null;
    onChange?:
        | ((value: MediaItem[], submission: MediaUploaderValue) => void)
        | ((value: MediaItem | null, submission: MediaUploaderValue) => void);
    onValidationError?: (errors: MediaValidationError[]) => void;
    onRemove?: (item: MediaItem) => void;
    onUploadComplete?: (item: MediaItem, response: unknown) => void;
    onUploadError?: (item: MediaItem, error: Error) => void;
}

function normalizeToArray(val: MediaItem[] | MediaItem | null | undefined): MediaItem[] {
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
}

export function useMediaUploader(options: UseMediaUploaderOptions) {
    const {
        multiple = false,
        maxFiles,
        maxSize,
        accept,
        preventDuplicates = true,
        crop,
        video: videoConfig,
        uploadHandler,
        autoUpload = false,
        uploadConcurrency = 3,
        value,
        defaultValue,
        onChange,
        onValidationError,
        onRemove,
        onUploadComplete,
        onUploadError,
    } = options;

    const isControlled = value !== undefined;
    const [internalItems, setInternalItems] = React.useState<MediaItem[]>(() =>
        normalizeToArray(defaultValue),
    );

    const items = isControlled ? normalizeToArray(value) : internalItems;
    const itemsRef = React.useRef<MediaItem[]>(items);
    itemsRef.current = items;

    const isMountedRef = React.useRef(true);
    const trackedUrlsRef = React.useRef<Set<string>>(new Set());
    const abortControllersRef = React.useRef<Map<string, AbortController>>(new Map());

    const trackUrl = React.useCallback((url: string | null | undefined) => {
        if (url && url.startsWith('blob:')) {
            trackedUrlsRef.current.add(url);
        }
    }, []);

    const revokeUrl = React.useCallback((url: string | null | undefined) => {
        if (url && url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
            trackedUrlsRef.current.delete(url);
        }
    }, []);

    const revokeItemUrls = React.useCallback(
        (item: MediaItem) => {
            if (item.category === 'image') {
                revokeUrl(item.previewUrl);
                if (item.originalPreviewUrl !== item.previewUrl) {
                    revokeUrl(item.originalPreviewUrl);
                }
            } else if (item.category === 'video') {
                revokeUrl(item.previewUrl);
                revokeUrl(item.thumbnailPreview);
            } else {
                revokeUrl(item.previewUrl);
            }
        },
        [revokeUrl],
    );

    React.useEffect(() => {
        isMountedRef.current = true;
        const abortControllers = abortControllersRef.current;
        const trackedUrls = trackedUrlsRef.current;
        return () => {
            isMountedRef.current = false;
            abortControllers.forEach((ctrl) => ctrl.abort());
            abortControllers.clear();
            trackedUrls.forEach((url) => URL.revokeObjectURL(url));
            trackedUrls.clear();
        };
    }, []);

    const commitItems = React.useCallback(
        (updater: MediaItem[] | ((prev: MediaItem[]) => MediaItem[])) => {
            const next =
                typeof updater === 'function' ? updater(itemsRef.current) : updater;
            itemsRef.current = next;
            if (!isControlled) {
                setInternalItems(next);
            }
            const submission = toMediaUploaderValue(next);
            if (onChange) {
                if (multiple) {
                    (onChange as (value: MediaItem[], submission: MediaUploaderValue) => void)(
                        next,
                        submission,
                    );
                } else {
                    (onChange as (value: MediaItem | null, submission: MediaUploaderValue) => void)(
                        next[0] ?? null,
                        submission,
                    );
                }
            }
        },
        [isControlled, multiple, onChange],
    );

    const updateItem = React.useCallback(
        (id: string, patch: (item: MediaItem) => MediaItem) => {
            if (!isMountedRef.current) return;
            commitItems((prev) => prev.map((it) => (it.id === id ? patch(it) : it)));
        },
        [commitItems],
    );

    const uploadItem = React.useCallback(
        async (id: string) => {
            if (!uploadHandler) return;
            const target = itemsRef.current.find((it) => it.id === id);
            if (!target || target.status === 'processing' || target.status === 'uploading') {
                return;
            }

            const existingController = abortControllersRef.current.get(id);
            existingController?.abort();

            const controller = new AbortController();
            abortControllersRef.current.set(id, controller);

            updateItem(id, (it) => ({
                ...it,
                status: 'uploading',
                progress: 0,
                error: undefined,
            }));

            try {
                const response = await uploadHandler(
                    target.file,
                    (progress) => {
                        if (!isMountedRef.current || controller.signal.aborted) return;
                        const clamped = Math.max(0, Math.min(100, progress));
                        updateItem(id, (it) => ({
                            ...it,
                            status: 'uploading',
                            progress: clamped,
                        }));
                    },
                    { item: target, signal: controller.signal },
                );

                if (!isMountedRef.current || controller.signal.aborted) return;

                let updatedItem: MediaItem | undefined;
                commitItems((prev) =>
                    prev.map((it) => {
                        if (it.id !== id) return it;
                        updatedItem = {
                            ...it,
                            status: 'success',
                            progress: 100,
                            uploadResponse: response,
                            error: undefined,
                        };
                        return updatedItem;
                    }),
                );

                if (updatedItem) {
                    onUploadComplete?.(updatedItem, response);
                }
            } catch (err) {
                if (controller.signal.aborted || !isMountedRef.current) return;
                const error = err instanceof Error ? err : new Error('Upload failed.');
                let erroredItem: MediaItem | undefined;
                commitItems((prev) =>
                    prev.map((it) => {
                        if (it.id !== id) return it;
                        erroredItem = {
                            ...it,
                            status: 'error',
                            error: error.message,
                        };
                        return erroredItem;
                    }),
                );
                if (erroredItem) {
                    onUploadError?.(erroredItem, error);
                }
            } finally {
                if (abortControllersRef.current.get(id) === controller) {
                    abortControllersRef.current.delete(id);
                }
            }
        },
        [commitItems, onUploadComplete, onUploadError, updateItem, uploadHandler],
    );

    const uploadAll = React.useCallback(async () => {
        if (!uploadHandler) return;
        const pending = itemsRef.current.filter(
            (it) => it.status === 'idle' || it.status === 'error',
        );
        if (pending.length === 0) return;

        const concurrency = Math.max(1, uploadConcurrency);
        let cursor = 0;

        const runWorker = async () => {
            while (cursor < pending.length && isMountedRef.current) {
                const current = pending[cursor++];
                if (current) {
                    await uploadItem(current.id);
                }
            }
        };

        await Promise.all(
            Array.from({ length: Math.min(concurrency, pending.length) }, () => runWorker()),
        );
    }, [uploadConcurrency, uploadHandler, uploadItem]);

    const processNewVideoItem = React.useCallback(
        async (item: VideoMediaItem) => {
            const shouldExtract =
                videoConfig?.enabled !== false && videoConfig?.generateThumbnail !== false;
            if (!shouldExtract) return;

            const controller = new AbortController();
            abortControllersRef.current.set(item.id, controller);

            try {
                const result = await extractVideoThumbnail(item.originalFile, {
                    timestamp: videoConfig?.thumbnailTimestamp ?? 1,
                    format: videoConfig?.thumbnailFormat ?? 'image/jpeg',
                    quality: videoConfig?.thumbnailQuality ?? 0.88,
                    signal: controller.signal,
                });

                if (!isMountedRef.current || controller.signal.aborted) {
                    URL.revokeObjectURL(result.thumbnailPreview);
                    return;
                }

                // Ensure item wasn't removed while extracting
                if (!itemsRef.current.some((it) => it.id === item.id)) {
                    URL.revokeObjectURL(result.thumbnailPreview);
                    return;
                }

                trackUrl(result.thumbnailPreview);
                updateItem(item.id, (it) => {
                    if (it.category !== 'video') return it;
                    return {
                        ...it,
                        thumbnail: result.thumbnail,
                        thumbnailPreview: result.thumbnailPreview,
                        thumbnailTimestamp: result.timestamp,
                        duration: result.duration,
                        dimensions: result.dimensions,
                        status: 'idle',
                        processingLabel: undefined,
                    };
                });

                if (autoUpload && uploadHandler) {
                    void uploadItem(item.id);
                }
            } catch (err) {
                if (controller.signal.aborted || !isMountedRef.current) return;
                const message =
                    err instanceof Error ? err.message : 'Unable to extract video thumbnail.';
                updateItem(item.id, (it) => ({
                    ...it,
                    status: 'idle',
                    processingLabel: undefined,
                    error: message,
                }));
            } finally {
                if (abortControllersRef.current.get(item.id) === controller) {
                    abortControllersRef.current.delete(item.id);
                }
            }
        },
        [autoUpload, trackUrl, updateItem, uploadHandler, uploadItem, videoConfig],
    );

    const processNewImageItem = React.useCallback(
        async (item: ImageMediaItem) => {
            try {
                const [dimensions, animatedGif] = await Promise.all([
                    getImageDimensions(item.originalFile),
                    isAnimatedGifFile(item.originalFile),
                ]);

                if (!isMountedRef.current || !itemsRef.current.some((it) => it.id === item.id)) {
                    return;
                }

                updateItem(item.id, (it) => {
                    if (it.category !== 'image') return it;
                    return {
                        ...it,
                        originalDimensions: dimensions,
                        dimensions,
                        isAnimatedGif: animatedGif,
                        status: 'idle',
                        processingLabel: undefined,
                    };
                });

                if (autoUpload && uploadHandler) {
                    void uploadItem(item.id);
                }
            } catch (err) {
                if (!isMountedRef.current) return;
                updateItem(item.id, (it) => ({
                    ...it,
                    status: 'error',
                    processingLabel: undefined,
                    error: err instanceof Error ? err.message : 'Failed to read image metadata.',
                }));
            }
        },
        [autoUpload, updateItem, uploadHandler, uploadItem],
    );

    const createItemFromFile = React.useCallback(
        (file: File): MediaItem => {
            const id = createMediaId();
            const category = detectMediaCategory(file);
            const mimeType = inferMimeType(file);
            const extension = getFileExtension(file.name);

            if (category === 'image') {
                const previewUrl = URL.createObjectURL(file);
                trackUrl(previewUrl);
                return {
                    id,
                    category: 'image',
                    file,
                    originalFile: file,
                    processedFile: null,
                    name: file.name,
                    size: file.size,
                    mimeType,
                    extension,
                    status: 'processing',
                    progress: 0,
                    processingLabel: 'Reading image...',
                    previewUrl,
                    originalPreviewUrl: previewUrl,
                    originalDimensions: null,
                    dimensions: null,
                    cropRect: null,
                    isCropped: false,
                };
            }

            if (category === 'video') {
                const previewUrl = URL.createObjectURL(file);
                trackUrl(previewUrl);
                const shouldExtract =
                    videoConfig?.enabled !== false && videoConfig?.generateThumbnail !== false;
                return {
                    id,
                    category: 'video',
                    file,
                    originalFile: file,
                    processedFile: null,
                    name: file.name,
                    size: file.size,
                    mimeType,
                    extension,
                    status: shouldExtract ? 'processing' : 'idle',
                    progress: 0,
                    processingLabel: shouldExtract ? 'Extracting thumbnail...' : undefined,
                    previewUrl,
                    thumbnail: null,
                    thumbnailPreview: null,
                    thumbnailTimestamp: videoConfig?.thumbnailTimestamp ?? 1,
                    duration: null,
                    dimensions: null,
                };
            }

            const isPreviewable = mimeType === 'application/pdf' || mimeType === 'text/plain' || mimeType === 'text/csv';
            const previewUrl = isPreviewable ? URL.createObjectURL(file) : null;
            if (previewUrl) trackUrl(previewUrl);

            return {
                id,
                category: 'file',
                file,
                originalFile: file,
                processedFile: null,
                name: file.name,
                size: file.size,
                mimeType,
                extension,
                status: 'idle',
                progress: 0,
                previewUrl,
            };
        },
        [trackUrl, videoConfig],
    );

    const addFiles = React.useCallback(
        async (rawFiles: File[]) => {
            if (rawFiles.length === 0) return;

            const { validFiles, errors } = await validateFiles({
                files: rawFiles,
                existingItems: multiple ? itemsRef.current : [],
                accept,
                maxSize,
                maxFiles,
                multiple,
                preventDuplicates,
            });

            if (errors.length > 0) {
                onValidationError?.(errors);
            }

            if (validFiles.length === 0 || !isMountedRef.current) return;

            const newItems = validFiles.map(createItemFromFile);

            if (!multiple) {
                // Single mode: replace existing item and clean up its URLs/tasks
                itemsRef.current.forEach((oldItem) => {
                    abortControllersRef.current.get(oldItem.id)?.abort();
                    abortControllersRef.current.delete(oldItem.id);
                    revokeItemUrls(oldItem);
                });
                commitItems(newItems.slice(0, 1));
            } else {
                commitItems((prev) => [...prev, ...newItems]);
            }

            for (const item of newItems) {
                if (item.category === 'image') {
                    void processNewImageItem(item);
                } else if (item.category === 'video') {
                    void processNewVideoItem(item);
                } else if (autoUpload && uploadHandler) {
                    void uploadItem(item.id);
                }
            }
        },
        [
            accept,
            autoUpload,
            commitItems,
            createItemFromFile,
            maxFiles,
            maxSize,
            multiple,
            onValidationError,
            preventDuplicates,
            processNewImageItem,
            processNewVideoItem,
            revokeItemUrls,
            uploadHandler,
            uploadItem,
        ],
    );

    const replaceItem = React.useCallback(
        async (id: string, newFile: File) => {
            const existingIndex = itemsRef.current.findIndex((it) => it.id === id);
            if (existingIndex === -1) return;

            const otherItems = itemsRef.current.filter((it) => it.id !== id);
            const { validFiles, errors } = await validateFiles({
                files: [newFile],
                existingItems: otherItems,
                accept,
                maxSize,
                maxFiles: multiple ? maxFiles : 1,
                multiple,
                preventDuplicates,
            });

            if (errors.length > 0) {
                onValidationError?.(errors);
            }
            if (validFiles.length === 0 || !isMountedRef.current) return;

            const oldItem = itemsRef.current[existingIndex];
            if (oldItem) {
                abortControllersRef.current.get(oldItem.id)?.abort();
                abortControllersRef.current.delete(oldItem.id);
                revokeItemUrls(oldItem);
            }

            const replacement = createItemFromFile(validFiles[0]);
            commitItems((prev) => prev.map((it) => (it.id === id ? replacement : it)));

            if (replacement.category === 'image') {
                void processNewImageItem(replacement);
            } else if (replacement.category === 'video') {
                void processNewVideoItem(replacement);
            } else if (autoUpload && uploadHandler) {
                void uploadItem(replacement.id);
            }
        },
        [
            accept,
            autoUpload,
            commitItems,
            createItemFromFile,
            maxFiles,
            maxSize,
            multiple,
            onValidationError,
            preventDuplicates,
            processNewImageItem,
            processNewVideoItem,
            revokeItemUrls,
            uploadHandler,
            uploadItem,
        ],
    );

    const removeItem = React.useCallback(
        (id: string) => {
            const target = itemsRef.current.find((it) => it.id === id);
            if (!target) return;

            abortControllersRef.current.get(id)?.abort();
            abortControllersRef.current.delete(id);
            revokeItemUrls(target);

            commitItems((prev) => prev.filter((it) => it.id !== id));
            onRemove?.(target);
        },
        [commitItems, onRemove, revokeItemUrls],
    );

    const clear = React.useCallback(() => {
        itemsRef.current.forEach((item) => {
            abortControllersRef.current.get(item.id)?.abort();
            abortControllersRef.current.delete(item.id);
            revokeItemUrls(item);
        });
        commitItems([]);
    }, [commitItems, revokeItemUrls]);

    /**
     * Applies a crop to an image item following all critical cropping rules:
     * - If the user made no changes and the original image already matches the aspect ratio (or free),
     *   preserve the original File untouched without re-encoding.
     * - Otherwise generate a new Canvas-cropped File.
     */
    const applyImageCrop = React.useCallback(
        async (id: string, cropRect: CropRect, hasUserModified: boolean) => {
            const target = itemsRef.current.find((it) => it.id === id);
            if (!target || target.category !== 'image') return;

            const dims = target.originalDimensions;
            const aspectMatches =
                !crop?.aspectRatio ||
                (dims ? doesAspectRatioMatch(dims, crop.aspectRatio) : false);
            const isFullImage = dims ? isFullImageCropRect(cropRect, dims) : false;

            // Rules 3, 5, 6, 7: Preserve original File when no cropping is actually needed
            if (!hasUserModified && aspectMatches) {
                return;
            }
            if (isFullImage && aspectMatches) {
                if (target.isCropped) {
                    if (target.previewUrl !== target.originalPreviewUrl) {
                        revokeUrl(target.previewUrl);
                    }
                    updateItem(id, (it) =>
                        it.category === 'image'
                            ? {
                                  ...it,
                                  file: it.originalFile,
                                  processedFile: null,
                                  name: it.originalFile.name,
                                  size: it.originalFile.size,
                                  mimeType: inferMimeType(it.originalFile),
                                  extension: getFileExtension(it.originalFile.name),
                                  previewUrl: it.originalPreviewUrl,
                                  dimensions: it.originalDimensions,
                                  cropRect: null,
                                  isCropped: false,
                              }
                            : it,
                    );
                }
                return;
            }

            updateItem(id, (it) => ({
                ...it,
                status: 'processing',
                processingLabel: 'Cropping image...',
                error: undefined,
            }));

            try {
                const result = await cropImageFile(target.originalFile, cropRect, crop);
                if (!isMountedRef.current || !itemsRef.current.some((it) => it.id === id)) {
                    URL.revokeObjectURL(result.previewUrl);
                    return;
                }

                trackUrl(result.previewUrl);
                if (target.previewUrl !== target.originalPreviewUrl) {
                    revokeUrl(target.previewUrl);
                }

                updateItem(id, (it) => {
                    if (it.category !== 'image') return it;
                    return {
                        ...it,
                        file: result.file,
                        processedFile: result.file,
                        name: result.file.name,
                        size: result.file.size,
                        mimeType: result.file.type,
                        extension: getFileExtension(result.file.name),
                        previewUrl: result.previewUrl,
                        dimensions: result.dimensions,
                        cropRect,
                        isCropped: true,
                        status: 'idle',
                        processingLabel: undefined,
                    };
                });
            } catch (err) {
                if (!isMountedRef.current) return;
                updateItem(id, (it) => ({
                    ...it,
                    status: 'error',
                    processingLabel: undefined,
                    error: err instanceof Error ? err.message : 'Failed to crop image.',
                }));
            }
        },
        [crop, revokeUrl, trackUrl, updateItem],
    );

    const resetImageCrop = React.useCallback(
        (id: string) => {
            const target = itemsRef.current.find((it) => it.id === id);
            if (!target || target.category !== 'image' || !target.isCropped) return;

            if (target.previewUrl !== target.originalPreviewUrl) {
                revokeUrl(target.previewUrl);
            }

            updateItem(id, (it) =>
                it.category === 'image'
                    ? {
                          ...it,
                          file: it.originalFile,
                          processedFile: null,
                          name: it.originalFile.name,
                          size: it.originalFile.size,
                          mimeType: inferMimeType(it.originalFile),
                          extension: getFileExtension(it.originalFile.name),
                          previewUrl: it.originalPreviewUrl,
                          dimensions: it.originalDimensions,
                          cropRect: null,
                          isCropped: false,
                          error: undefined,
                      }
                    : it,
            );
        },
        [revokeUrl, updateItem],
    );

    const regenerateVideoThumbnail = React.useCallback(
        async (id: string, timestamp?: number) => {
            const target = itemsRef.current.find((it) => it.id === id);
            if (!target || target.category !== 'video') return;

            const existingCtrl = abortControllersRef.current.get(id);
            existingCtrl?.abort();
            const controller = new AbortController();
            abortControllersRef.current.set(id, controller);

            const targetTimestamp =
                timestamp ?? target.thumbnailTimestamp ?? videoConfig?.thumbnailTimestamp ?? 1;

            updateItem(id, (it) => ({
                ...it,
                status: 'processing',
                processingLabel: 'Generating thumbnail...',
                error: undefined,
            }));

            try {
                const result = await extractVideoThumbnail(target.originalFile, {
                    timestamp: targetTimestamp,
                    format: videoConfig?.thumbnailFormat ?? 'image/jpeg',
                    quality: videoConfig?.thumbnailQuality ?? 0.88,
                    signal: controller.signal,
                });

                if (!isMountedRef.current || controller.signal.aborted) {
                    URL.revokeObjectURL(result.thumbnailPreview);
                    return;
                }

                trackUrl(result.thumbnailPreview);
                if (target.thumbnailPreview) {
                    revokeUrl(target.thumbnailPreview);
                }

                updateItem(id, (it) =>
                    it.category === 'video'
                        ? {
                              ...it,
                              thumbnail: result.thumbnail,
                              thumbnailPreview: result.thumbnailPreview,
                              thumbnailTimestamp: result.timestamp,
                              duration: result.duration ?? it.duration,
                              dimensions: result.dimensions ?? it.dimensions,
                              status: 'idle',
                              processingLabel: undefined,
                              error: undefined,
                          }
                        : it,
                );
            } catch (err) {
                if (controller.signal.aborted || !isMountedRef.current) return;
                updateItem(id, (it) => ({
                    ...it,
                    status: 'idle',
                    processingLabel: undefined,
                    error:
                        err instanceof Error
                            ? err.message
                            : 'Failed to generate video thumbnail.',
                }));
            } finally {
                if (abortControllersRef.current.get(id) === controller) {
                    abortControllersRef.current.delete(id);
                }
            }
        },
        [revokeUrl, trackUrl, updateItem, videoConfig],
    );

    const getSubmissionValue = React.useCallback((): MediaUploaderValue => {
        return toMediaUploaderValue(itemsRef.current);
    }, []);

    return {
        items,
        addFiles,
        replaceItem,
        removeItem,
        clear,
        uploadItem,
        uploadAll,
        applyImageCrop,
        resetImageCrop,
        regenerateVideoThumbnail,
        getSubmissionValue,
    };
}
