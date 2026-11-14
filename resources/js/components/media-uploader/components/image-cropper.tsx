import * as React from 'react';
import {
    Crop as CropIcon,
    Maximize2,
    RotateCcw,
    ZoomIn,
    ZoomOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import type { CropConfig, CropRect, ImageDimensions, ImageMediaItem } from '../types';
import {
    clampCropRect,
    computeCenteredCropRect,
    doesAspectRatioMatch,
    loadImageElement,
} from '../utils/image-processing';

type HandleCorner = 'nw' | 'ne' | 'sw' | 'se';
type DragMode =
    | { type: 'move'; startX: number; startY: number; startRect: CropRect }
    | { type: 'resize'; corner: HandleCorner; startX: number; startY: number; startRect: CropRect }
    | { type: 'pan'; startX: number; startY: number; startPanX: number; startPanY: number };

interface AspectPreset {
    label: string;
    value: number | undefined;
}

const ASPECT_PRESETS: AspectPreset[] = [
    { label: 'Free', value: undefined },
    { label: '1:1', value: 1 },
    { label: '4:3', value: 4 / 3 },
    { label: '16:9', value: 16 / 9 },
    { label: '3:2', value: 3 / 2 },
    { label: '9:16', value: 9 / 16 },
];

export interface ImageCropperProps {
    item: ImageMediaItem | null;
    open: boolean;
    cropConfig?: CropConfig;
    onOpenChange: (open: boolean) => void;
    onApply: (itemId: string, cropRect: CropRect, hasUserModified: boolean) => void;
    onResetToOriginal?: (itemId: string) => void;
}

function formatAspectLabel(ratio: number | undefined): string {
    if (!ratio) return 'Free';
    const match = ASPECT_PRESETS.find((p) => p.value && Math.abs(p.value - ratio) < 0.01);
    if (match) return match.label;
    return `${ratio.toFixed(2)}:1`;
}

function resizeCropWithAspect(
    startRect: CropRect,
    corner: HandleCorner,
    dx: number,
    dy: number,
    naturalDims: ImageDimensions,
    aspectRatio: number | undefined,
    minSize: number,
): CropRect {
    const minW = Math.min(minSize, naturalDims.width);
    const minH = Math.min(minSize, naturalDims.height);

    let left = startRect.x;
    let top = startRect.y;
    let right = startRect.x + startRect.width;
    let bottom = startRect.y + startRect.height;

    if (corner === 'nw' || corner === 'sw') {
        left = Math.max(0, Math.min(startRect.x + dx, right - minW));
    } else {
        right = Math.min(naturalDims.width, Math.max(startRect.x + startRect.width + dx, left + minW));
    }

    if (corner === 'nw' || corner === 'ne') {
        top = Math.max(0, Math.min(startRect.y + dy, bottom - minH));
    } else {
        bottom = Math.min(
            naturalDims.height,
            Math.max(startRect.y + startRect.height + dy, top + minH),
        );
    }

    let width = right - left;
    let height = bottom - top;

    if (aspectRatio && aspectRatio > 0) {
        // Adjust height from width, or clamp by available vertical space
        const desiredH = width / aspectRatio;
        if (corner === 'nw' || corner === 'ne') {
            const maxAvailableH = bottom;
            if (desiredH > maxAvailableH) {
                height = maxAvailableH;
                width = height * aspectRatio;
            } else {
                height = desiredH;
            }
            top = bottom - height;
            if (corner === 'nw') {
                left = right - width;
            }
        } else {
            const maxAvailableH = naturalDims.height - top;
            if (desiredH > maxAvailableH) {
                height = maxAvailableH;
                width = height * aspectRatio;
            } else {
                height = desiredH;
            }
            if (corner === 'sw') {
                left = right - width;
            }
        }
    }

    return clampCropRect(
        { x: left, y: top, width, height },
        naturalDims,
        minSize,
    );
}

export function ImageCropper({
    item,
    open,
    cropConfig,
    onOpenChange,
    onApply,
    onResetToOriginal,
}: ImageCropperProps) {
    const stageRef = React.useRef<HTMLDivElement>(null);
    const previewCanvasRef = React.useRef<HTMLCanvasElement>(null);
    const loadedImageRef = React.useRef<HTMLImageElement | null>(null);

    const [stageSize, setStageSize] = React.useState<{ width: number; height: number }>({
        width: 560,
        height: 400,
    });
    const [naturalDims, setNaturalDims] = React.useState<ImageDimensions>({
        width: 1000,
        height: 1000,
    });
    const [activeAspectRatio, setActiveAspectRatio] = React.useState<number | undefined>(
        cropConfig?.aspectRatio,
    );
    const [cropRect, setCropRect] = React.useState<CropRect>({
        x: 0,
        y: 0,
        width: 1000,
        height: 1000,
    });
    const [zoom, setZoom] = React.useState(1);
    const [pan, setPan] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [hasModified, setHasModified] = React.useState(false);
    const [dragMode, setDragMode] = React.useState<DragMode | null>(null);

    const isAspectLocked =
        cropConfig?.aspectRatio !== undefined && !cropConfig?.allowAspectRatioChange;

    // Measure stage container responsively
    React.useEffect(() => {
        if (!open) return;
        const el = stageRef.current;
        if (!el) return;

        const updateSize = () => {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                setStageSize({ width: rect.width, height: rect.height });
            }
        };
        updateSize();

        const observer = new ResizeObserver(updateSize);
        observer.observe(el);
        return () => observer.disconnect();
    }, [open]);

    // Initialize crop state when dialog opens with an item
    React.useEffect(() => {
        if (!open || !item) return;

        let cancelled = false;
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setActiveAspectRatio(cropConfig?.aspectRatio);
        setHasModified(false);

        loadImageElement(item.originalPreviewUrl)
            .then((img) => {
                if (cancelled) return;
                loadedImageRef.current = img;
                const dims = { width: img.naturalWidth, height: img.naturalHeight };
                setNaturalDims(dims);

                if (item.cropRect) {
                    setCropRect(clampCropRect(item.cropRect, dims));
                } else {
                    setCropRect(computeCenteredCropRect(dims, cropConfig?.aspectRatio));
                }
            })
            .catch(() => {
                // Handled gracefully if image fails
            });

        return () => {
            cancelled = true;
            loadedImageRef.current = null;
        };
    }, [open, item, cropConfig?.aspectRatio]);

    // Render real-time preview on canvas
    React.useEffect(() => {
        if (!open || !previewCanvasRef.current || !loadedImageRef.current) return;
        const canvas = previewCanvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = loadedImageRef.current;
        if (!ctx || cropRect.width <= 0 || cropRect.height <= 0) return;

        const maxPreviewSize = 180;
        const scale = Math.min(maxPreviewSize / cropRect.width, maxPreviewSize / cropRect.height, 1);
        const targetW = Math.max(1, Math.round(cropRect.width * scale));
        const targetH = Math.max(1, Math.round(cropRect.height * scale));

        canvas.width = targetW;
        canvas.height = targetH;
        ctx.clearRect(0, 0, targetW, targetH);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(
            img,
            cropRect.x,
            cropRect.y,
            cropRect.width,
            cropRect.height,
            0,
            0,
            targetW,
            targetH,
        );
    }, [open, cropRect, naturalDims]);

    const baseScale = Math.min(
        (stageSize.width - 32) / Math.max(1, naturalDims.width),
        (stageSize.height - 32) / Math.max(1, naturalDims.height),
    );
    const displayScale = Math.max(0.01, baseScale * zoom);
    const renderedImgW = naturalDims.width * displayScale;
    const renderedImgH = naturalDims.height * displayScale;

    const maxPanX = Math.max(0, (renderedImgW - stageSize.width + 32) / 2);
    const maxPanY = Math.max(0, (renderedImgH - stageSize.height + 32) / 2);
    const clampedPanX = Math.max(-maxPanX, Math.min(maxPanX, pan.x));
    const clampedPanY = Math.max(-maxPanY, Math.min(maxPanY, pan.y));

    const imgLeft = (stageSize.width - renderedImgW) / 2 + clampedPanX;
    const imgTop = (stageSize.height - renderedImgH) / 2 + clampedPanY;

    const cropBoxLeft = imgLeft + cropRect.x * displayScale;
    const cropBoxTop = imgTop + cropRect.y * displayScale;
    const cropBoxW = cropRect.width * displayScale;
    const cropBoxH = cropRect.height * displayScale;

    const handlePointerDownMove = (e: React.PointerEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        setDragMode({
            type: 'move',
            startX: e.clientX,
            startY: e.clientY,
            startRect: cropRect,
        });
    };

    const handlePointerDownResize = (
        corner: HandleCorner,
        e: React.PointerEvent<HTMLDivElement>,
    ) => {
        e.preventDefault();
        e.stopPropagation();
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        setDragMode({
            type: 'resize',
            corner,
            startX: e.clientX,
            startY: e.clientY,
            startRect: cropRect,
        });
    };

    const handlePointerDownPan = (e: React.PointerEvent<HTMLDivElement>) => {
        if (zoom <= 1) return;
        e.preventDefault();
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        setDragMode({
            type: 'pan',
            startX: e.clientX,
            startY: e.clientY,
            startPanX: clampedPanX,
            startPanY: clampedPanY,
        });
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!dragMode) return;
        const dxScreen = e.clientX - dragMode.startX;
        const dyScreen = e.clientY - dragMode.startY;

        if (dragMode.type === 'pan') {
            setPan({
                x: Math.max(-maxPanX, Math.min(maxPanX, dragMode.startPanX + dxScreen)),
                y: Math.max(-maxPanY, Math.min(maxPanY, dragMode.startPanY + dyScreen)),
            });
            return;
        }

        const dxNatural = dxScreen / displayScale;
        const dyNatural = dyScreen / displayScale;
        const minSize = Math.max(16, cropConfig?.minWidth ?? 24, cropConfig?.minHeight ?? 24);

        if (dragMode.type === 'move') {
            const next = clampCropRect(
                {
                    ...dragMode.startRect,
                    x: dragMode.startRect.x + dxNatural,
                    y: dragMode.startRect.y + dyNatural,
                },
                naturalDims,
                minSize,
            );
            setCropRect(next);
            setHasModified(true);
            return;
        }

        if (dragMode.type === 'resize') {
            const next = resizeCropWithAspect(
                dragMode.startRect,
                dragMode.corner,
                dxNatural,
                dyNatural,
                naturalDims,
                activeAspectRatio,
                minSize,
            );
            setCropRect(next);
            setHasModified(true);
        }
    };

    const handlePointerUp = () => {
        setDragMode(null);
    };

    const handleSelectAspect = (ratio: number | undefined) => {
        setActiveAspectRatio(ratio);
        setCropRect(computeCenteredCropRect(naturalDims, ratio));
        setHasModified(true);
    };

    const handleReset = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setActiveAspectRatio(cropConfig?.aspectRatio);
        setCropRect(computeCenteredCropRect(naturalDims, cropConfig?.aspectRatio));
        setHasModified(false);
    };

    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.15 : -0.15;
        setZoom((z) => Math.min(3, Math.max(1, Number((z + delta).toFixed(2)))));
    };

    if (!item) return null;

    const aspectAlreadyMatched =
        !cropConfig?.aspectRatio || doesAspectRatioMatch(naturalDims, cropConfig.aspectRatio);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl gap-0 overflow-hidden p-0">
                <DialogHeader className="border-b px-6 py-4">
                    <div className="flex items-center justify-between pr-6">
                        <div>
                            <DialogTitle className="flex items-center gap-2 text-base">
                                <CropIcon className="size-4 text-primary-color" />
                                Crop Image
                            </DialogTitle>
                            <DialogDescription className="mt-0.5 text-xs">
                                Drag the corners to resize or drag inside the selection to reposition.
                            </DialogDescription>
                        </div>
                        <Badge variant="outline" className="font-mono text-[11px]">
                            {naturalDims.width} × {naturalDims.height} px
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-[1fr_240px]">
                    {/* Interactive Crop Stage */}
                    <div className="flex flex-col bg-muted/30">
                        <div
                            ref={stageRef}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            onPointerCancel={handlePointerUp}
                            onPointerDown={handlePointerDownPan}
                            onWheel={handleWheel}
                            className={cn(
                                'relative h-[360px] w-full overflow-hidden select-none touch-none sm:h-[420px]',
                                zoom > 1 && 'cursor-grab active:cursor-grabbing',
                            )}
                        >
                            {/* Original Image */}
                            <img
                                src={item.originalPreviewUrl}
                                alt={item.name}
                                draggable={false}
                                className="pointer-events-none absolute max-w-none"
                                style={{
                                    left: imgLeft,
                                    top: imgTop,
                                    width: renderedImgW,
                                    height: renderedImgH,
                                }}
                            />

                            {/* Darkened Backdrop using box-shadow around crop box */}
                            <div
                                className="pointer-events-none absolute"
                                style={{
                                    left: cropBoxLeft,
                                    top: cropBoxTop,
                                    width: cropBoxW,
                                    height: cropBoxH,
                                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.58)',
                                }}
                            />

                            {/* Interactive Crop Box */}
                            <div
                                role="region"
                                aria-label="Crop selection"
                                onPointerDown={handlePointerDownMove}
                                className="absolute cursor-move border border-white/90 shadow-xs"
                                style={{
                                    left: cropBoxLeft,
                                    top: cropBoxTop,
                                    width: cropBoxW,
                                    height: cropBoxH,
                                }}
                            >
                                {/* Rule-of-thirds grid */}
                                <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
                                    <div className="border-r border-b border-white/25" />
                                    <div className="border-r border-b border-white/25" />
                                    <div className="border-b border-white/25" />
                                    <div className="border-r border-b border-white/25" />
                                    <div className="border-r border-b border-white/25" />
                                    <div className="border-b border-white/25" />
                                    <div className="border-r border-white/25" />
                                    <div className="border-r border-white/25" />
                                    <div />
                                </div>

                                {/* 4 Corner Handles */}
                                {(['nw', 'ne', 'sw', 'se'] as HandleCorner[]).map((corner) => (
                                    <div
                                        key={corner}
                                        role="slider"
                                        aria-label={`Resize ${corner} corner`}
                                        aria-valuenow={Math.round(cropRect.width)}
                                        tabIndex={0}
                                        onPointerDown={(e) => handlePointerDownResize(corner, e)}
                                        className={cn(
                                            'absolute size-3.5 rounded-xs border border-white bg-primary-color shadow-sm transition-transform hover:scale-125',
                                            corner === 'nw' && '-top-1.5 -left-1.5 cursor-nwse-resize',
                                            corner === 'ne' && '-top-1.5 -right-1.5 cursor-nesw-resize',
                                            corner === 'sw' && '-bottom-1.5 -left-1.5 cursor-nesw-resize',
                                            corner === 'se' && '-bottom-1.5 -right-1.5 cursor-nwse-resize',
                                        )}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Zoom & Position Toolbar */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-t bg-background px-4 py-2.5">
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-7"
                                    onClick={() => setZoom((z) => Math.max(1, Number((z - 0.25).toFixed(2))))}
                                    disabled={zoom <= 1}
                                    aria-label="Zoom out"
                                >
                                    <ZoomOut className="size-3.5" />
                                </Button>
                                <input
                                    type="range"
                                    min={1}
                                    max={3}
                                    step={0.05}
                                    value={zoom}
                                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                                    aria-label="Zoom level"
                                    className="h-1.5 w-28 cursor-pointer accent-primary-color"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-7"
                                    onClick={() => setZoom((z) => Math.min(3, Number((z + 0.25).toFixed(2))))}
                                    disabled={zoom >= 3}
                                    aria-label="Zoom in"
                                >
                                    <ZoomIn className="size-3.5" />
                                </Button>
                                <span className="min-w-10 text-xs text-muted-foreground tabular-nums">
                                    {Math.round(zoom * 100)}%
                                </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                                {zoom > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 px-2 text-xs"
                                        onClick={() => {
                                            setZoom(1);
                                            setPan({ x: 0, y: 0 });
                                        }}
                                    >
                                        <Maximize2 className="mr-1 size-3" />
                                        Fit
                                    </Button>
                                )}
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-xs"
                                    onClick={handleReset}
                                >
                                    <RotateCcw className="mr-1 size-3" />
                                    Reset
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar: Live Preview & Aspect Controls */}
                    <div className="flex flex-col justify-between border-t bg-background p-4 md:border-t-0 md:border-l">
                        <div className="space-y-4">
                            <div>
                                <p className="mb-2 text-xs font-medium text-foreground">Live Preview</p>
                                <div className="flex h-36 items-center justify-center overflow-hidden rounded-md border bg-muted/30 p-2">
                                    <canvas
                                        ref={previewCanvasRef}
                                        className="max-h-full max-w-full rounded-xs object-contain shadow-xs"
                                    />
                                </div>
                                <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                                    <span>Output size</span>
                                    <span className="font-mono">
                                        {Math.round(cropRect.width)} × {Math.round(cropRect.height)} px
                                    </span>
                                </div>
                                <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                                    <span>Aspect ratio</span>
                                    <span className="font-mono">{formatAspectLabel(activeAspectRatio)}</span>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <p className="mb-2 text-xs font-medium text-foreground">Aspect Ratio</p>
                                {isAspectLocked ? (
                                    <div className="rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                                        Locked to{' '}
                                        <span className="font-medium text-foreground">
                                            {formatAspectLabel(cropConfig?.aspectRatio)}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 gap-1.5">
                                        {ASPECT_PRESETS.map((preset) => {
                                            const active =
                                                preset.value === undefined
                                                    ? activeAspectRatio === undefined
                                                    : activeAspectRatio !== undefined &&
                                                      Math.abs(activeAspectRatio - preset.value) < 0.01;
                                            return (
                                                <Button
                                                    key={preset.label}
                                                    type="button"
                                                    variant={active ? 'default' : 'outline'}
                                                    size="sm"
                                                    className="h-7 px-2 text-xs"
                                                    onClick={() => handleSelectAspect(preset.value)}
                                                >
                                                    {preset.label}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {!hasModified && aspectAlreadyMatched && !item.isCropped && (
                                <p className="rounded-md border border-dashed bg-muted/20 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
                                    Original image will be preserved without re-encoding unless you adjust the crop area.
                                </p>
                            )}
                        </div>

                        {item.isCropped && onResetToOriginal && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="mt-4 h-8 w-full text-xs"
                                onClick={() => {
                                    onResetToOriginal(item.id);
                                    onOpenChange(false);
                                }}
                            >
                                Restore Original Image
                            </Button>
                        )}
                    </div>
                </div>

                <DialogFooter className="border-t bg-muted/20 px-6 py-3">
                    <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                            onApply(item.id, cropRect, hasModified);
                            onOpenChange(false);
                        }}
                    >
                        Apply Crop
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
