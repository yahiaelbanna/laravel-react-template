import * as React from 'react';
import { Camera, Film, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { VideoMediaItem } from '../types';
import { formatDuration } from '../utils/file-validation';

export interface VideoThumbnailDialogProps {
    item: VideoMediaItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCaptureFrame: (itemId: string, timestamp: number) => Promise<void> | void;
}

export function VideoThumbnailDialog({
    item,
    open,
    onOpenChange,
    onCaptureFrame,
}: VideoThumbnailDialogProps) {
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const [currentTime, setCurrentTime] = React.useState(0);
    const [duration, setDuration] = React.useState(0);
    const [isCapturing, setIsCapturing] = React.useState(false);

    React.useEffect(() => {
        if (!open || !item) return;
        const initial = item.thumbnailTimestamp ?? 0;
        setCurrentTime(initial);
        setDuration(item.duration ?? 0);
    }, [open, item]);

    if (!item) return null;

    const handleLoadedMetadata = () => {
        const video = videoRef.current;
        if (!video) return;
        const dur = Number.isFinite(video.duration) ? video.duration : 0;
        setDuration(dur);
        const start = Math.min(item.thumbnailTimestamp ?? 0, Math.max(0, dur - 0.05));
        video.currentTime = start;
        setCurrentTime(start);
    };

    const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
        const nextTime = parseFloat(e.target.value);
        setCurrentTime(nextTime);
        if (videoRef.current) {
            videoRef.current.currentTime = nextTime;
        }
    };

    const handleCapture = async () => {
        setIsCapturing(true);
        try {
            await onCaptureFrame(item.id, currentTime);
            onOpenChange(false);
        } finally {
            setIsCapturing(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl gap-0 overflow-hidden p-0">
                <DialogHeader className="border-b px-6 py-4">
                    <div className="flex items-center justify-between pr-6">
                        <div>
                            <DialogTitle className="flex items-center gap-2 text-base">
                                <Film className="size-4 text-primary-color" />
                                Select Video Thumbnail Frame
                            </DialogTitle>
                            <DialogDescription className="mt-0.5 text-xs">
                                Scrub the timeline or pause the video at your preferred frame, then capture.
                            </DialogDescription>
                        </div>
                        {duration > 0 && (
                            <Badge variant="outline" className="font-mono text-[11px]">
                                {formatDuration(currentTime)} / {formatDuration(duration)}
                            </Badge>
                        )}
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-[1fr_200px]">
                    <div className="space-y-3">
                        <div className="overflow-hidden rounded-lg border bg-black">
                            <video
                                ref={videoRef}
                                src={item.previewUrl}
                                controls
                                preload="metadata"
                                onLoadedMetadata={handleLoadedMetadata}
                                onTimeUpdate={() => {
                                    if (videoRef.current) {
                                        setCurrentTime(videoRef.current.currentTime);
                                    }
                                }}
                                className="aspect-video w-full object-contain"
                            />
                        </div>

                        {duration > 0 && (
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>Timeline Frame</span>
                                    <span className="font-mono tabular-nums">
                                        {currentTime.toFixed(2)}s
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={Math.max(0.1, duration - 0.05)}
                                    step={0.05}
                                    value={Math.min(currentTime, duration)}
                                    onChange={handleScrub}
                                    aria-label="Video timeline scrubber"
                                    className="h-1.5 w-full cursor-pointer accent-primary-color"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col justify-between rounded-lg border bg-muted/20 p-3">
                        <div>
                            <p className="mb-2 text-xs font-medium text-foreground">
                                Current Thumbnail
                            </p>
                            <div className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-md border bg-background">
                                {item.thumbnailPreview ? (
                                    <img
                                        src={item.thumbnailPreview}
                                        alt={`${item.name} thumbnail`}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span className="text-[11px] text-muted-foreground">
                                        No thumbnail yet
                                    </span>
                                )}
                            </div>
                            <p className="mt-2 text-[11px] text-muted-foreground">
                                Captured at{' '}
                                <span className="font-mono font-medium text-foreground">
                                    {item.thumbnailTimestamp.toFixed(2)}s
                                </span>
                            </p>
                        </div>

                        <Button
                            type="button"
                            size="sm"
                            className="mt-4 w-full text-xs"
                            disabled={isCapturing}
                            onClick={handleCapture}
                        >
                            {isCapturing ? (
                                <>
                                    <RefreshCw className="mr-1.5 size-3.5 animate-spin" />
                                    Capturing...
                                </>
                            ) : (
                                <>
                                    <Camera className="mr-1.5 size-3.5" />
                                    Use Frame ({currentTime.toFixed(1)}s)
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                <DialogFooter className="border-t bg-muted/20 px-6 py-3">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
