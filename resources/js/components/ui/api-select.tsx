import * as React from 'react';
import { Check, ChevronDown, Loader2, RefreshCw, Search, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { get } from '@/services/api.service';
import { ApiSelectConfig } from '@/types/form-config-type';

export interface ApiSelectProps<T> {
    field: ApiSelectConfig<T>;
    value?: string | number | (string | number)[];
    defaultValue?: string | number | (string | number)[];
    onChange?: (value: any, item: any) => void;
    className?: string;
    triggerClassName?: string;
    contentClassName?: string;
    labelClass?: string;
    maxDisplayTags?: number;
}

export default function ApiSelect<T>({
    field,
    value,
    defaultValue,
    onChange,
    className,
    triggerClassName,
    contentClassName,
    maxDisplayTags = 3,
}: ApiSelectProps<T>) {
    const isMultiple = Boolean(field.multiple);
    const [open, setOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [debouncedSearch, setDebouncedSearch] = React.useState('');

    const [items, setItems] = React.useState<T[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // Cache of fetched items by value so tags retain their data even when search query changes
    const itemsCache = React.useRef<Map<string, T>>(new Map());

    // Normalize value to array of strings
    const parseValues = (val: unknown): string[] => {
        if (val === undefined || val === null || val === '') return [];
        return (Array.isArray(val) ? val : [val]).map(String);
    };

    // Support controlled and uncontrolled usage
    const isControlled = value !== undefined;
    const [internalValues, setInternalValues] = React.useState<string[]>(() => {
        const initial = value !== undefined ? value : (defaultValue ?? field.defaultValue);
        return parseValues(initial);
    });

    const selectedStrings = React.useMemo(() => {
        const raw = isControlled ? value : internalValues;
        return parseValues(raw);
    }, [isControlled, value, internalValues]);

    const selectedValue = selectedStrings[0] || '';

    // Cache items whenever new ones are fetched
    React.useEffect(() => {
        items.forEach((item) => {
            const val = String(field.getOptionValue(item));
            itemsCache.current.set(val, item);
        });
    }, [items, field]);

    // Debounce the search input
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
        const itemVal = String(field.getOptionValue(item));
        itemsCache.current.set(itemVal, item);

        if (isMultiple) {
            const next = selectedStrings.includes(itemVal)
                ? selectedStrings.filter((v) => v !== itemVal)
                : [...selectedStrings, itemVal];

            if (!isControlled) {
                setInternalValues(next);
            }
            const selectedItems = next.map((val) => itemsCache.current.get(val)).filter(Boolean) as T[];
            onChange?.(next, selectedItems);
            // Keep open so multiple items can be chosen
        } else {
            const next = selectedValue === itemVal ? '' : itemVal;
            const nextArray = next ? [next] : [];

            if (!isControlled) {
                setInternalValues(nextArray);
            }
            onChange?.(next, next === '' ? null : item);
            setOpen(false);
        }
    };

    const handleRemoveTag = (e: React.MouseEvent, val: string) => {
        e.stopPropagation();
        if (field.disabled || field.readonly) return;

        const next = selectedStrings.filter((v) => v !== val);
        if (!isControlled) {
            setInternalValues(next);
        }
        const selectedItems = next.map((v) => itemsCache.current.get(v)).filter(Boolean) as T[];
        onChange?.(next, selectedItems);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (field.disabled || field.readonly) return;

        if (!isControlled) {
            setInternalValues([]);
        }
        if (isMultiple) {
            onChange?.([], []);
        } else {
            onChange?.('', null);
        }
    };

    return (
        <div className={cn('relative w-full', className)}>
            {/* Hidden input(s) for HTML / Inertia form bindings */}
            {field.key &&
                (isMultiple
                    ? selectedStrings.map((val) => (
                        <input key={val} type="hidden" name={`${field.key}[]`} value={val} />
                    ))
                    : <input type="hidden" name={field.key} value={selectedValue} />
                )}

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild disabled={field.disabled}>
                    <button
                        id={field.key}
                        type="button"
                        role="combobox"
                        aria-expanded={open}
                        disabled={field.disabled}
                        className={cn(
                            'flex w-full items-center justify-between gap-1.5 rounded-md border border-input bg-background text-base md:text-xs font-light ring-offset-background text-start transition-colors',
                            isMultiple ? 'min-h-9.5 h-auto px-3 py-1.5' : 'h-9.5 px-3 py-2',
                            'focus:outline-hidden focus:ring-2 focus:ring-ring/15 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                            open && 'ring-2 ring-ring/15 ring-offset-2 border-input',
                            field.className,
                            triggerClassName
                        )}
                    >
                        {isMultiple ? (
                            <div className="flex flex-1 flex-wrap items-center gap-1 overflow-hidden py-0.5">
                                {selectedStrings.length === 0 ? (
                                    <span className="text-muted-foreground select-none">
                                        {field.placeholder || 'Select options...'}
                                    </span>
                                ) : (
                                    <>
                                        {selectedStrings.slice(0, maxDisplayTags).map((val) => {
                                            const item = itemsCache.current.get(val);
                                            const label = item ? field.getOptionLabel(item) : val;

                                            return (
                                                <Badge
                                                    key={val}
                                                    variant="secondary"
                                                    className="px-1.5 py-0 h-fit text-base md:text-[11px] font-normal max-w-[150px] truncate flex items-center gap-1 group/badge bg-muted text-foreground/90 border-0"
                                                >
                                                    <span className="truncate">{label}</span>
                                                    {!field.disabled && !field.readonly && (
                                                        <span
                                                            role="button"
                                                            tabIndex={0}
                                                            onClick={(e) => handleRemoveTag(e, val)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' || e.key === ' ') {
                                                                    e.preventDefault();
                                                                    handleRemoveTag(e as any, val);
                                                                }
                                                            }}
                                                            className="opacity-50 hover:opacity-100 rounded-full hover:bg-muted-foreground/20 p-0.5 transition-opacity"
                                                        >
                                                            <X className="size-2.5" />
                                                        </span>
                                                    )}
                                                </Badge>
                                            );
                                        })}
                                        {selectedStrings.length > maxDisplayTags && (
                                            <Badge
                                                variant="secondary"
                                                className="px-1.5 py-0 text-base md:text-[11px] font-normal shrink-0 bg-muted text-muted-foreground border-0"
                                            >
                                                +{selectedStrings.length - maxDisplayTags} more
                                            </Badge>
                                        )}
                                    </>
                                )}
                            </div>
                        ) : (
                            <span className="flex-1 truncate">
                                {selectedStrings.length > 0 ? (
                                    <span className="text-foreground">
                                        {(() => {
                                            const item =
                                                itemsCache.current.get(selectedValue) ||
                                                items.find((i) => String(field.getOptionValue(i)) === selectedValue);
                                            return item ? field.getOptionLabel(item) : selectedValue;
                                        })()}
                                    </span>
                                ) : (
                                    <span className="text-muted-foreground select-none">
                                        {field.placeholder || 'Select an option...'}
                                    </span>
                                )}
                            </span>
                        )}

                        <div className="flex items-center gap-1 shrink-0 ms-1">
                            {selectedStrings.length > 0 && !field.disabled && !field.readonly && (
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
                        'w-[var(--radix-popover-trigger-width)] min-w-[12rem] p-1 shadow-md rounded-md border bg-popover text-popover-foreground z-50 overflow-hidden',
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
                                const optValStr = String(field.getOptionValue(item));
                                const isSelected = selectedStrings.includes(optValStr);

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
                                        <div className="flex-1 truncate">{field.getOptionLabel(item)}</div>
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