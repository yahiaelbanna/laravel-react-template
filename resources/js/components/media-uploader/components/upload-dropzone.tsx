import * as React from 'react';
import { UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { formatBytes } from '../utils/file-validation';

export interface UploadDropzoneProps {
    inputId?: string;
    accept?: string;
    multiple?: boolean;
    maxSize?: number;
    maxFiles?: number;
    currentCount?: number;
    disabled?: boolean;
    readOnly?: boolean;
    hasError?: boolean;
    title?: string;
    description?: string;
    browseLabel?: string;
    emptyState?: React.ReactNode;
    onFilesSelected: (files: File[]) => void;
    inputRef: React.RefObject<HTMLInputElement | null>;
    className?: string;
}

export function UploadDropzone({
    inputId,
    accept,
    multiple = false,
    maxSize,
    maxFiles,
    currentCount = 0,
    disabled = false,
    readOnly = false,
    hasError = false,
    title = 'Drop files here or click to browse',
    description,
    browseLabel = 'Select files',
    emptyState,
    onFilesSelected,
    inputRef,
    className,
}: UploadDropzoneProps) {
    const [isDragging, setIsDragging] = React.useState(false);
    const dragDepthRef = React.useRef(0);

    const isInteractive = !disabled && !readOnly;
    const isAtLimit = multiple && maxFiles !== undefined && currentCount >= maxFiles;

    const openPicker = () => {
        if (!isInteractive || isAtLimit) return;
        inputRef.current?.click();
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isInteractive || isAtLimit) return;
        dragDepthRef.current += 1;
        if (dragDepthRef.current === 1) {
            setIsDragging(true);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isInteractive || isAtLimit) return;
        e.dataTransfer.dropEffect = 'copy';
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isInteractive) return;
        dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
        if (dragDepthRef.current === 0) {
            setIsDragging(false);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        dragDepthRef.current = 0;
        setIsDragging(false);

        if (!isInteractive || isAtLimit) return;
        const droppedFiles = Array.from(e.dataTransfer.files ?? []);
        if (droppedFiles.length > 0) {
            onFilesSelected(droppedFiles);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files ?? []);
        if (selected.length > 0) {
            onFilesSelected(selected);
        }
        // Reset input so selecting the same file again triggers onChange if needed
        e.target.value = '';
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openPicker();
        }
    };

    const autoDescription = React.useMemo(() => {
        if (description) return description;
        const parts: string[] = [];
        if (accept) parts.push(`Accepted: ${accept}`);
        if (maxSize) parts.push(`Max size: ${formatBytes(maxSize)}`);
        if (multiple && maxFiles !== undefined) {
            parts.push(`${currentCount}/${maxFiles} files`);
        }
        return parts.join(' • ') || 'Images, videos, or documents supported';
    }, [accept, currentCount, description, maxFiles, maxSize, multiple]);

    return (
        <div
            role="button"
            tabIndex={isInteractive && !isAtLimit ? 0 : -1}
            aria-disabled={!isInteractive || isAtLimit}
            aria-label={title}
            onClick={openPicker}
            onKeyDown={handleKeyDown}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
                'group relative flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-8 text-center transition-all outline-none',
                'border-border bg-muted/20 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring/40',
                isDragging &&
                    'border-primary-color bg-primary-color/5 ring-2 ring-primary-color/20',
                hasError && 'border-destructive/60 bg-destructive/5',
                (!isInteractive || isAtLimit) &&
                    'cursor-not-allowed opacity-60 hover:bg-muted/20',
                isInteractive && !isAtLimit && 'cursor-pointer',
                className,
            )}
        >
            <input
                ref={inputRef}
                id={inputId}
                type="file"
                accept={accept}
                multiple={multiple}
                disabled={!isInteractive || isAtLimit}
                onChange={handleInputChange}
                className="sr-only"
                tabIndex={-1}
            />

            {emptyState ?? (
                <>
                    <div
                        className={cn(
                            'mb-3 flex size-11 items-center justify-center rounded-full border bg-background shadow-xs transition-colors',
                            isDragging
                                ? 'border-primary-color text-primary-color'
                                : 'text-muted-foreground group-hover:text-foreground',
                        )}
                    >
                        <UploadCloud className="size-5" />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                        {isAtLimit
                            ? `Maximum limit of ${maxFiles} file${maxFiles === 1 ? '' : 's'} reached`
                            : isDragging
                              ? 'Drop files to add'
                              : title}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{autoDescription}</p>
                    {isInteractive && !isAtLimit && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-4 h-8 text-xs"
                            onClick={(e) => {
                                e.stopPropagation();
                                openPicker();
                            }}
                        >
                            {browseLabel}
                        </Button>
                    )}
                </>
            )}
        </div>
    );
}
