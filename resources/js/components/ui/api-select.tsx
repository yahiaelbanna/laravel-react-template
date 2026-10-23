import * as React from 'react';
import { Check, ChevronDown, Loader2, RefreshCw, Search, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { cn } from '@/lib/utils';
import { get } from '@/services/api.service';
import { ApiSelectConfig } from '@/types/form-config-type';

export interface ApiSelectProps<T> {
    field: ApiSelectConfig<T>;
    value?: string | number;
    defaultValue?: string | number;
    onChange?: (value: string, item: T | null) => void;
    className?: string;
    triggerClassName?: string;
    contentClassName?: string;
    labelClass?: string;
}

export default function ApiSelect<T>({
    field,
    value,
    defaultValue,
    onChange,
    className,
    triggerClassName,
    contentClassName,
}: ApiSelectProps<T>) {
    const [open, setOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [debouncedSearch, setDebouncedSearch] = React.useState('');

    const [items, setItems] = React.useState<T[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // Support both controlled and uncontrolled selection
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = React.useState<string>(() => {
        const initial = value !== undefined ? value : (defaultValue ?? field.defaultValue);
        return initial !== undefined && initial !== null ? String(initial) : '';
    });

    const selectedValue = isControlled ? (value !== undefined ? String(value) : '') : internalValue;

    // Debounce the search input to avoid hitting the API on every keystroke
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 350);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Data fetching function with abort controller
    const fetchData = React.useCallback(
        async (signal?: AbortSignal) => {
            if (!field.options.endpoint) return;

            setLoading(true);
            setError(null);

            try {
                const response = await get<T>({
                    ...field.options,
                    search: debouncedSearch,
                    signal,
                });

                setItems(response.data || []);
            } catch (err: any) {
                if (err.name !== 'AbortError') {
                    setError(err.message || 'Failed to load options');
                }
            } finally {
                setLoading(false);
            }
        },
        [field.options, debouncedSearch]
    );

    // Fetch on initial load or when debounced search / endpoint changes
    React.useEffect(() => {
        const controller = new AbortController();
        fetchData(controller.signal);

        return () => {
            controller.abort();
        };
    }, [fetchData]);

    const handleSelect = (item: T) => {
        const itemVal = field.getOptionValue(item);
        const next = selectedValue === itemVal ? '' : itemVal;

        if (!isControlled) {
            setInternalValue(next);
        }
        onChange?.(next, next === '' ? null : item);
        setOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (field.disabled || field.readonly) return;

        if (!isControlled) {
            setInternalValue('');
        }
        onChange?.('', null);
    };

    // Find the currently selected item object to display its label
    const selectedItem = React.useMemo(() => {
        if (!selectedValue) return null;
        return items.find((item) => field.getOptionValue(item) === selectedValue) || null;
    }, [items, selectedValue, field]);

    return (
        <div className={cn('relative w-full', className)}>
            {/* Hidden input for HTML / Inertia form bindings */}
            {field.key && <input type="hidden" name={field.key} value={selectedValue} />}

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild disabled={field.disabled}>
                    <button
                        id={field.key}
                        type="button"
                        role="combobox"
                        aria-expanded={open}
                        disabled={field.disabled}
                        className={cn(
                            'flex h-9.5 w-full items-center justify-between gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-base md:text-xs font-light ring-offset-background text-start transition-colors',
                            'focus:outline-hidden focus:ring-2 focus:ring-ring/15 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                            open && 'ring-2 ring-ring/15 ring-offset-2 border-input',
                            field.className,
                            triggerClassName
                        )}
                    >
                        <span className="flex-1 truncate">
                            {selectedItem ? (
                                <span className="text-foreground">{field.getOptionLabel(selectedItem)}</span>
                            ) : (
                                <span className="text-muted-foreground select-none">
                                    {field.placeholder || 'Select an option...'}
                                </span>
                            )}
                        </span>

                        <div className="flex items-center gap-1 shrink-0 ms-1">
                            {selectedValue && !field.disabled && !field.readonly && (
                                <span
                                    role="button"
                                    tabIndex={0}
                                    onClick={handleClear}
                                    title="Clear selection"
                                    className="p-0.5 rounded-sm opacity-50 hover:opacity-100 transition-opacity hover:bg-muted text-muted-foreground cursor-pointer"
                                >
                                    <X className="size-3.5" />
                                </span>
                            )}
                            {loading ? (
                                <Loader2 className="size-3.5 text-muted-foreground animate-spin shrink-0" />
                            ) : (
                                <ChevronDown
                                    className={cn(
                                        'size-4 opacity-50 transition-transform duration-200 shrink-0',
                                        open && 'rotate-180'
                                    )}
                                />
                            )}
                        </div>
                    </button>
                </PopoverTrigger>

                <PopoverContent
                    align="start"
                    sideOffset={4}
                    className={cn(
                        'w-[var(--radix-popover-trigger-width)] min-w-[8rem] p-1 shadow-md rounded-md border bg-popover text-popover-foreground z-50 overflow-hidden',
                        contentClassName
                    )}
                >
                    {/* Search bar */}
                    <div className="flex items-center gap-2 border-b border-border/50 px-2.5 py-1.5 mb-1">
                        <Search className="size-3.5 text-muted-foreground shrink-0" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search..."
                            className="w-full bg-transparent text-base md:text-xs font-light outline-hidden placeholder:text-muted-foreground text-foreground"
                            autoFocus
                        />
                        {loading && <Loader2 className="size-3 text-muted-foreground animate-spin shrink-0" />}
                        {searchQuery && !loading && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="text-muted-foreground hover:text-foreground p-0.5"
                            >
                                <X className="size-3" />
                            </button>
                        )}
                    </div>

                    {/* Options list / loading / error */}
                    <div className="max-h-60 overflow-y-auto p-0.5 space-y-0.5">
                        {loading && items.length === 0 ? (
                            <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground font-light">
                                <Loader2 className="size-3.5 animate-spin" />
                                <span>Loading options...</span>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center gap-2 py-4 px-2 text-center text-xs text-destructive">
                                <span>{error}</span>
                                <button
                                    type="button"
                                    onClick={() => fetchData()}
                                    className="flex items-center gap-1 text-[11px] text-foreground hover:underline cursor-pointer"
                                >
                                    <RefreshCw className="size-3" />
                                    <span>Retry</span>
                                </button>
                            </div>
                        ) : items.length === 0 ? (
                            <div className="py-3 text-center text-base md:text-xs font-light text-muted-foreground">
                                No options found
                            </div>
                        ) : (
                            items.map((item) => {
                                const optValStr = field.getOptionValue(item);
                                const isSelected = selectedValue === optValStr;

                                return (
                                    <div
                                        key={optValStr}
                                        role="option"
                                        aria-selected={isSelected}
                                        onClick={() => handleSelect(item)}
                                        className={cn(
                                            'relative flex w-full cursor-pointer select-none items-center justify-between rounded-sm py-1.5 px-2.5 text-base md:text-xs font-light outline-hidden transition-colors',
                                            isSelected
                                                ? 'bg-accent text-accent-foreground font-medium'
                                                : 'hover:bg-accent/50 text-foreground'
                                        )}
                                    >
                                        <span className="flex-1 truncate">{field.getOptionLabel(item)}</span>
                                        {isSelected && (
                                            <Check className="size-3.5 shrink-0 text-accent-foreground ms-2" />
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}