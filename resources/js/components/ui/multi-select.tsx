import * as React from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { SelectOption } from '@/types/form-config-type';

export interface MultiSelectProps {
    id?: string;
    name?: string;
    options: SelectOption[];
    value?: (string | number)[];
    defaultValue?: (string | number)[] | string | number;
    onChange?: (values: string[]) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    className?: string;
    triggerClassName?: string;
    contentClassName?: string;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    maxDisplayTags?: number;
    showSearchThreshold?: number;
}

export function MultiSelect({
    id,
    name,
    options = [],
    value,
    defaultValue,
    onChange,
    placeholder = 'Select options...',
    searchPlaceholder = 'Search...',
    className,
    triggerClassName,
    contentClassName,
    disabled = false,
    readOnly = false,
    maxDisplayTags = 5,
    showSearchThreshold = 4,
}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');

    const [internalValue, setInternalValue] = React.useState<string[]>(() => {
        const initial = value !== undefined ? value : defaultValue;
        if (!initial) return [];
        return (Array.isArray(initial) ? initial : [initial]).map(String);
    });

    const isControlled = value !== undefined;
    const selectedStrings = React.useMemo(() => {
        const raw = isControlled ? value : internalValue;
        if (!raw) return [];
        return (Array.isArray(raw) ? raw : [raw]).map(String);
    }, [isControlled, value, internalValue]);

    const optionMap = React.useMemo(() => {
        const map = new Map<string, string>();
        options.forEach((opt) => {
            map.set(String(opt.value), opt.label);
        });
        return map;
    }, [options]);

    const filteredOptions = React.useMemo(() => {
        if (!searchQuery.trim()) return options;
        const q = searchQuery.toLowerCase();
        return options.filter((opt) => opt.label.toLowerCase().includes(q));
    }, [options, searchQuery]);

    const handleToggle = (optionValue: string) => {
        if (disabled || readOnly) return;
        const next = selectedStrings.includes(optionValue)
            ? selectedStrings.filter((v) => v !== optionValue)
            : [...selectedStrings, optionValue];

        if (!isControlled) {
            setInternalValue(next);
        }
        onChange?.(next);
    };

    const handleClearAll = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (disabled || readOnly) return;

        if (!isControlled) {
            setInternalValue([]);
        }
        onChange?.([]);
    };

    const handleRemoveTag = (e: React.MouseEvent, val: string) => {
        e.stopPropagation();
        if (disabled || readOnly) return;

        const next = selectedStrings.filter((v) => v !== val);
        if (!isControlled) {
            setInternalValue(next);
        }
        onChange?.(next);
    };

    return (
        <div className={cn('relative w-full', className)}>
            {name &&
                selectedStrings.map((val) => (
                    <input key={val} type="hidden" name={`${name}[]`} value={val} />
                ))}

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild disabled={disabled}>
                    <button
                        id={id}
                        type="button"
                        aria-expanded={open}
                        disabled={disabled}
                        className={cn(
                            'flex min-h-9.5 h-auto w-full items-center justify-between gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-base md:text-xs font-normal ring-offset-background text-start transition-colors',
                            'focus:outline-hidden focus:ring-2 focus:ring-ring/15 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                            open && 'ring-2 ring-ring/15 ring-offset-2 border-input',
                            triggerClassName
                        )}
                    >
                        <div className="flex flex-1 flex-wrap items-center gap-1 overflow-hidden py-0.5">
                            {selectedStrings.length === 0 ? (
                                <span className="text-muted-foreground text-base md:text-xs font-normal select-none">
                                    {placeholder}
                                </span>
                            ) : (
                                <>
                                    {selectedStrings.slice(0, maxDisplayTags).map((val) => (
                                        <Badge
                                            key={val}
                                            variant="secondary"
                                            className="px-1.5 py-0 text-base md:text-[11px] font-normal max-w-[130px] truncate flex items-center gap-1 group/badge bg-muted text-foreground/90 border-0"
                                        >
                                            <span className="truncate">{optionMap.get(val) || val}</span>
                                            {!disabled && !readOnly && (
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
                                    ))}
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

                        <div className="flex items-center gap-1 shrink-0 ms-1">
                            {selectedStrings.length > 0 && !disabled && !readOnly && (
                                <span
                                    role="button"
                                    tabIndex={0}
                                    onClick={handleClearAll}
                                    title="Clear all"
                                    className="p-0.5 rounded-sm opacity-50 hover:opacity-100 transition-opacity hover:bg-muted text-muted-foreground cursor-pointer"
                                >
                                    <X className="size-3.5" />
                                </span>
                            )}
                            <ChevronDown
                                className={cn(
                                    'size-4 opacity-50 transition-transform duration-200 shrink-0',
                                    open && 'rotate-180'
                                )}
                            />
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
                    {options.length >= showSearchThreshold && (
                        <div className="flex items-center gap-2 border-b border-border/50 px-2.5 py-1.5 mb-1">
                            <Search className="size-3.5 text-muted-foreground shrink-0" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={searchPlaceholder}
                                className="w-full bg-transparent text-base md:text-xs outline-hidden placeholder:text-muted-foreground text-foreground"
                                autoFocus
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="text-muted-foreground hover:text-foreground p-0.5"
                                >
                                    <X className="size-3" />
                                </button>
                            )}
                        </div>
                    )}

                    <div className="max-h-60 overflow-y-auto p-0.5 space-y-0.5">
                        {filteredOptions.length === 0 ? (
                            <div className="py-3 text-center text-base md:text-xs text-muted-foreground">
                                No options found
                            </div>
                        ) : (
                            filteredOptions.map((option) => {
                                const optValStr = String(option.value);
                                const isChecked = selectedStrings.includes(optValStr);

                                return (
                                    <div
                                        key={optValStr}
                                        role="option"
                                        aria-selected={isChecked}
                                        onClick={() => !option.disabled && handleToggle(optValStr)}
                                        className={cn(
                                            'relative flex w-full cursor-pointer select-none items-center justify-between rounded-sm px-2.5 py-1.5 text-base md:text-xs font-normal outline-hidden transition-colors',
                                            isChecked
                                                ? 'bg-accent text-accent-foreground font-medium'
                                                : 'hover:bg-accent/50 text-foreground',
                                            option.disabled &&
                                            'pointer-events-none opacity-50 cursor-not-allowed'
                                        )}
                                    >
                                        <span className="flex-1 truncate">{option.label}</span>
                                        {isChecked && (
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

export default MultiSelect;