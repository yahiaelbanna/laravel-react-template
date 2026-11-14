import * as React from 'react';
import {
    Eye,
    File as FileIcon,
    FileArchive,
    FileSpreadsheet,
    FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { GenericFileMediaItem } from '../types';
import { formatBytes } from '../utils/file-validation';

export function getFileTypeIcon(extension: string, mimeType: string) {
    const ext = extension.toLowerCase();
    if (ext === 'pdf' || mimeType === 'application/pdf') {
        return { Icon: FileText, tone: 'text-red-500 bg-red-500/10 border-red-500/20' };
    }
    if (['xls', 'xlsx', 'csv'].includes(ext) || mimeType.includes('spreadsheet') || mimeType === 'text/csv') {
        return { Icon: FileSpreadsheet, tone: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' };
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext) || mimeType.includes('zip')) {
        return { Icon: FileArchive, tone: 'text-amber-600 bg-amber-500/10 border-amber-500/20' };
    }
    if (['doc', 'docx', 'txt', 'md', 'rtf'].includes(ext) || mimeType.includes('word') || mimeType === 'text/plain') {
        return { Icon: FileText, tone: 'text-blue-500 bg-blue-500/10 border-blue-500/20' };
    }
    return { Icon: FileIcon, tone: 'text-muted-foreground bg-muted border-border' };
}

export function isPreviewableGenericFile(item: GenericFileMediaItem): boolean {
    return (
        item.mimeType === 'application/pdf' ||
        item.mimeType === 'text/plain' ||
        item.mimeType === 'text/csv'
    );
}

export interface FilePreviewThumbnailProps {
    item: GenericFileMediaItem;
    onOpenPreview?: (item: GenericFileMediaItem) => void;
}

export function FilePreviewThumbnail({ item, onOpenPreview }: FilePreviewThumbnailProps) {
    const { Icon, tone } = getFileTypeIcon(item.extension, item.mimeType);
    const canPreview = isPreviewableGenericFile(item) && !!item.previewUrl;

    return (
        <div className="flex items-center gap-3">
            <div
                className={`flex size-12 shrink-0 items-center justify-center rounded-lg border ${tone}`}
            >
                <Icon className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground" title={item.name}>
                    {item.name}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                    {item.extension && (
                        <Badge variant="secondary" className="h-4 px-1.5 font-mono text-[10px] uppercase">
                            .{item.extension}
                        </Badge>
                    )}
                    <span className="truncate max-w-[160px]" title={item.mimeType}>
                        {item.mimeType}
                    </span>
                    <span>•</span>
                    <span>{formatBytes(item.size)}</span>
                </div>
            </div>
            {canPreview && onOpenPreview && (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0"
                    onClick={() => onOpenPreview(item)}
                    aria-label={`Preview ${item.name}`}
                >
                    <Eye className="size-4" />
                </Button>
            )}
        </div>
    );
}

export interface FilePreviewDialogProps {
    item: GenericFileMediaItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function FilePreviewDialog({ item, open, onOpenChange }: FilePreviewDialogProps) {
    const [textContent, setTextContent] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!open || !item) {
            setTextContent(null);
            return;
        }
        if (item.mimeType === 'text/plain' || item.mimeType === 'text/csv') {
            let cancelled = false;
            item.file
                .slice(0, 128 * 1024)
                .text()
                .then((txt) => {
                    if (!cancelled) setTextContent(txt);
                })
                .catch(() => {
                    if (!cancelled) setTextContent('Unable to read file contents.');
                });
            return () => {
                cancelled = true;
            };
        }
    }, [open, item]);

    if (!item) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="truncate pr-6 text-base">{item.name}</DialogTitle>
                    <DialogDescription className="text-xs">
                        {item.mimeType} • {formatBytes(item.size)}
                    </DialogDescription>
                </DialogHeader>

                {item.mimeType === 'application/pdf' && item.previewUrl ? (
                    <div className="h-[65vh] w-full overflow-hidden rounded-md border bg-muted/20">
                        <iframe
                            src={item.previewUrl}
                            title={item.name}
                            className="h-full w-full border-0"
                        />
                    </div>
                ) : (item.mimeType === 'text/plain' || item.mimeType === 'text/csv') &&
                  textContent !== null ? (
                    <pre className="max-h-[60vh] overflow-auto rounded-md border bg-muted/30 p-4 font-mono text-xs leading-relaxed text-foreground">
                        {textContent}
                    </pre>
                ) : (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                        Direct preview is not available for this file format.
                    </p>
                )}
            </DialogContent>
        </Dialog>
    );
}
