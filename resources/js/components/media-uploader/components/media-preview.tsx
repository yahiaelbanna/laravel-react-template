import * as React from 'react';
import {
    AlertCircle,
    CheckCircle2,
    Crop,
    Film,
    Loader2,
    MoreHorizontal,
    RefreshCw,
    RotateCcw,
    Trash2,
    Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type {
    CropConfig,
    GenericFileMediaItem,
    ImageMediaItem,
    MediaItem,
    MediaUploaderLabels,
    VideoConfig,
    VideoMediaItem,
} from '../types';
import { formatBytes, formatDuration } from '../utils/file-validation';
import { FilePreviewThumbnail } from './file-preview';

export interface MediaPreviewProps {
    item: MediaItem;
    accept?: string;
    crop?: CropConfig;
    video?: VideoConfig;
    hasUploadHandler?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    labels?: MediaUploaderLabels;
    onRemove: (id: string) => void;
    onReplace: (id: string, file: File) => void;
    onOpenCropper: (item: ImageMediaItem) => void;
    onResetCrop: (id: string) => void;
    onOpenVideoFramePicker: (item: VideoMediaItem) => void;
    onRegenerateThumbnail: (id: string) => void;
    onOpenFilePreview: (item: GenericFileMediaItem) => void;
    onUploadItem: (id: string) => void;
}

export function MediaPreview({
    item,
    accept,
    crop,
    video,
    hasUploadHandler = false,
    disabled = false,
    readOnly = false,
    labels,
    onRemove,
    onReplace,
    onOpenCropper,
    onResetCrop,
    onOpenVideoFramePicker,
    onRegenerateThumbnail,
    onOpenFilePreview,
    onUploadItem,
}: MediaPreviewProps) {
    const replaceInputRef = React.useRef<HTMLInputElement>(null);
    const isInteractive = !disabled && !readOnly;

    const handleReplaceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onReplace(item.id, file);
        }
        e.target.value = '';
    };

    const statusBadge = () => {
        switch (item.status) {
            case 'processing':
                return (
                    <Badge variant="secondary" className="gap-1 text-[10px]">
                        <Loader2 className="size-3 animate-spin" />
                        {item.processingLabel ?? 'Processing'}
                    </Badge>
                );
            case 'uploading':
                return (
                    <Badge variant="secondary" className="gap-1 text-[10px]">
                        <Loader2 className="size-3 animate-spin" />
                        {Math.round(item.progress)}%
                    </Badge>
                );
            case 'success':
                return (
                    <Badge
                        variant="outline"
                        className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-600 dark:text-emerald-400"
                    >
                        <CheckCircle2 className="size-3" />
                        Uploaded
                    </Badge>
                );
            case 'error':
                return (
                    <Badge variant="destructive" className="gap-1 text-[10px]">
                        <AlertCircle className="size-3" />
                        Error
                    </Badge>
                );
            default:
                return null;
        }
    };

    return (
        <Card
            className={cn(
                'group relative flex flex-col overflow-hidden border bg-card transition-colors',
                item.status === 'error' && 'border-destructive/50',
            )}
        >
            <input
                ref={replaceInputRef}
                type="file"
                accept={accept}
                disabled={!isInteractive}
                onChange={handleReplaceChange}
                className="sr-only"
                tabIndex={-1}
            />

            {/* Media Visual Area */}
            {item.category === 'image' && (
                <div className="relative flex h-44 w-full items-center justify-center overflow-hidden border-b bg-muted/30 p-2">
                    <img
                        src={item.previewUrl}
                        alt={item.name}
                        className="max-h-full max-w-full rounded-xs object-contain"
                    />
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                        {item.isCropped && (
                            <Badge variant="secondary" className="text-[10px]">
                                Cropped
                            </Badge>
                        )}
                        {item.isAnimatedGif && !item.isCropped && (
                            <Badge variant="secondary" className="text-[10px]">
                                GIF
                            </Badge>
                        )}
                    </div>
                    {isInteractive && crop?.enabled && (
                        <div className="absolute right-2 bottom-2 flex items-center gap-1">
                            <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                className="h-7 px-2 text-xs shadow-xs"
                                onClick={() => onOpenCropper(item)}
                            >
                                <Crop className="mr-1 size-3" />
                                {labels?.cropLabel ?? 'Crop'}
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {item.category === 'video' && (
                <div className="border-b bg-muted/20">
                    {/* Original Video Preview (never replaced by thumbnail) */}
                    <div className="relative aspect-video w-full bg-black">
                        <video
                            src={item.previewUrl}
                            controls
                            preload="metadata"
                            className="h-full w-full object-contain"
                        />
                    </div>

                    {/* Associated Thumbnail Strip */}
                    <div className="flex items-center justify-between gap-2 border-t bg-muted/30 px-3 py-2">
                        <div className="flex min-w-0 items-center gap-2">
                            {item.status === 'processing' && !item.thumbnailPreview ? (
                                <Skeleton className="h-9 w-16 shrink-0 rounded-xs" />
                            ) : item.thumbnailPreview ? (
                                <img
                                    src={item.thumbnailPreview}
                                    alt={`${item.name} thumbnail`}
                                    className="h-9 w-16 shrink-0 rounded-xs border object-cover"
                                />
                            ) : (
                                <div className="flex h-9 w-16 shrink-0 items-center justify-center rounded-xs border bg-background text-muted-foreground">
                                    <Film className="size-4" />
                                </div>
                            )}
                            <div className="min-w-0">
                                <p className="text-[11px] font-medium text-foreground">
                                    Thumbnail
                                </p>
                                <p className="truncate text-[10px] text-muted-foreground">
                                    {item.thumbnail
                                        ? `Frame @ ${item.thumbnailTimestamp.toFixed(1)}s`
                                        : item.status === 'processing'
                                          ? 'Extracting...'
                                          : 'Not generated'}
                                    {item.duration ? ` • ${formatDuration(item.duration)}` : ''}
                                </p>
                            </div>
                        </div>

                        {isInteractive && video?.enabled !== false && (
                            <div className="flex shrink-0 items-center gap-1">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="size-7"
                                            disabled={item.status === 'processing'}
                                            onClick={() => onRegenerateThumbnail(item.id)}
                                            aria-label={
                                                labels?.regenerateThumbnailLabel ??
                                                'Regenerate thumbnail'
                                            }
                                        >
                                            <RefreshCw
                                                className={cn(
                                                    'size-3.5',
                                                    item.status === 'processing' && 'animate-spin',
                                                )}
                                            />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Regenerate thumbnail</TooltipContent>
                                </Tooltip>

                                {video?.allowManualThumbnailSelection !== false && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-7 px-2 text-[11px]"
                                        onClick={() => onOpenVideoFramePicker(item)}
                                    >
                                        {labels?.selectFrameLabel ?? 'Pick frame'}
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Metadata & Actions Footer */}
            <div className="flex flex-1 flex-col justify-between gap-2 p-3">
                {item.category === 'file' ? (
                    <FilePreviewThumbnail item={item} onOpenPreview={onOpenFilePreview} />
                ) : (
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                            <p
                                className="truncate text-sm font-medium text-foreground"
                                title={item.name}
                            >
                                {item.name}
                            </p>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                                {formatBytes(item.size)}
                                {item.dimensions
                                    ? ` • ${item.dimensions.width}×${item.dimensions.height}`
                                    : ''}
                                {item.extension ? ` • ${item.extension.toUpperCase()}` : ''}
                            </p>
                        </div>
                    </div>
                )}

                {/* Progress / Status Row */}
                {item.status === 'uploading' && (
                    <div className="space-y-1">
                        <Progress value={item.progress} className="h-1.5" />
                    </div>
                )}

                {item.error && (
                    <div className="flex items-start gap-1.5 rounded-md border border-destructive/30 bg-destructive/5 px-2.5 py-1.5 text-[11px] text-destructive">
                        <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                        <span className="leading-snug">{item.error}</span>
                    </div>
                )}

                {/* Bottom Action Bar */}
                <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-1.5">{statusBadge()}</div>

                    <div className="flex items-center gap-1">
                        {isInteractive &&
                            hasUploadHandler &&
                            (item.status === 'idle' || item.status === 'error') && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-7 px-2 text-xs"
                                    onClick={() => onUploadItem(item.id)}
                                >
                                    <Upload className="mr-1 size-3" />
                                    {item.status === 'error'
                                        ? (labels?.retryLabel ?? 'Retry')
                                        : 'Upload'}
                                </Button>
                            )}

                        {isInteractive && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="size-7"
                                        aria-label={`Actions for ${item.name}`}
                                    >
                                        <MoreHorizontal className="size-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {item.category === 'image' && crop?.enabled && (
                                        <DropdownMenuItem onClick={() => onOpenCropper(item)}>
                                            <Crop className="mr-2 size-3.5" />
                                            {labels?.cropLabel ?? 'Crop image'}
                                        </DropdownMenuItem>
                                    )}
                                    {item.category === 'image' && item.isCropped && (
                                        <DropdownMenuItem onClick={() => onResetCrop(item.id)}>
                                            <RotateCcw className="mr-2 size-3.5" />
                                            Restore original
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem
                                        onClick={() => replaceInputRef.current?.click()}
                                    >
                                        <RefreshCw className="mr-2 size-3.5" />
                                        {labels?.replaceLabel ?? 'Replace'}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="text-destructive focus:text-destructive"
                                        onClick={() => onRemove(item.id)}
                                    >
                                        <Trash2 className="mr-2 size-3.5" />
                                        {labels?.removeLabel ?? 'Remove'}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}
