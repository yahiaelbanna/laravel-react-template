import * as React from 'react';
import { Calendar as CalendarIcon, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface DatePickerProps {
    id?: string;
    name?: string;
    value?: Date | string | null;
    defaultValue?: Date | string | null;
    onChange?: (date: Date | null, formatted: string) => void;
    format?: 'DD/MM/YYYY' | 'YYYY-MM-DD' | string;
    placeholder?: string;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    minDate?: Date | string;
    maxDate?: Date | string;
    className?: string;
    inputClassName?: string;
}

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_NAMES_SHORT = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const WEEKDAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/**
 * Format a Date object to YYYY-MM-DD
 */
function toISODate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Format a Date object to the chosen format (defaults to DD/MM/YYYY)
 */
function formatDateDisplay(d: Date, format: string = 'DD/MM/YYYY'): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    if (format === 'YYYY-MM-DD') {
        return `${year}-${month}-${day}`;
    }
    return `${day}/${month}/${year}`;
}

/**
 * Parse string or Date to Date object safely
 */
function parseDate(input: unknown): Date | null {
    if (!input) return null;
    if (input instanceof Date) {
        return isNaN(input.getTime()) ? null : input;
    }
    if (typeof input !== 'string') return null;

    const trimmed = input.trim();
    if (!trimmed) return null;

    // Check with separators: DD/MM/YYYY or YYYY-MM-DD or DD-MM-YYYY
    const parts = trimmed.split(/[-/.]/);
    if (parts.length === 3) {
        let y: number, m: number, d: number;
        if (parts[0].length === 4) {
            // YYYY-MM-DD
            y = parseInt(parts[0], 10);
            m = parseInt(parts[1], 10);
            d = parseInt(parts[2], 10);
        } else {
            // DD/MM/YYYY
            d = parseInt(parts[0], 10);
            m = parseInt(parts[1], 10);
            y = parseInt(parts[2], 10);
        }

        if (y >= 1000 && y <= 9999 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
            const date = new Date(y, m - 1, d);
            if (date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d) {
                return date;
            }
        }
    }

    // Pure digits: DDMMYYYY
    const digits = trimmed.replace(/\D/g, '');
    if (digits.length === 8) {
        const d = parseInt(digits.slice(0, 2), 10);
        const m = parseInt(digits.slice(2, 4), 10);
        const y = parseInt(digits.slice(4, 8), 10);
        if (y >= 1000 && y <= 9999 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
            const date = new Date(y, m - 1, d);
            if (date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d) {
                return date;
            }
        }
    }

    return null;
}

export function DatePicker({
    id,
    name,
    value,
    defaultValue,
    onChange,
    format = 'DD/MM/YYYY',
    placeholder,
    disabled = false,
    readOnly = false,
    required = false,
    minDate,
    maxDate,
    className,
    inputClassName,
}: DatePickerProps) {
    const isControlled = value !== undefined;
    const initialDate = React.useMemo(() => parseDate(value !== undefined ? value : defaultValue), []);

    const [selectedDate, setSelectedDate] = React.useState<Date | null>(initialDate);
    const [open, setOpen] = React.useState(false);

    // Current navigation state in calendar
    const [viewDate, setViewDate] = React.useState<Date>(() => initialDate ?? new Date());
    const [view, setView] = React.useState<'days' | 'months' | 'years'>('days');

    // Display string in the input field
    const [displayString, setDisplayString] = React.useState<string>(() => {
        return initialDate ? formatDateDisplay(initialDate, format) : '';
    });

    const parsedMinDate = React.useMemo(() => (minDate ? parseDate(minDate) : null), [minDate]);
    const parsedMaxDate = React.useMemo(() => (maxDate ? parseDate(maxDate) : null), [maxDate]);

    // Synchronize when controlled value changes
    React.useEffect(() => {
        if (isControlled) {
            const parsed = parseDate(value);
            setSelectedDate(parsed);
            if (parsed) {
                setDisplayString(formatDateDisplay(parsed, format));
                setViewDate(parsed);
            } else {
                setDisplayString('');
            }
        }
    }, [value, isControlled, format]);

    const activeDate = isControlled ? parseDate(value) : selectedDate;

    const commitDate = (date: Date | null) => {
        if (!isControlled) {
            setSelectedDate(date);
        }
        if (date) {
            setDisplayString(formatDateDisplay(date, format));
            setViewDate(date);
            onChange?.(date, toISODate(date));
        } else {
            setDisplayString('');
            onChange?.(null, '');
        }
    };

    /**
     * Smart digit auto-masking:
     * When user types digits (DDMMYYYY), automatically formats as DD/MM/YYYY
     */
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled || readOnly) return;

        const val = e.target.value;
        const nativeEvent = e.nativeEvent as InputEvent;
        const isDeleting = nativeEvent.inputType === 'deleteContentBackward';

        // When deleting a slash, also delete the preceding number
        if (isDeleting && displayString.endsWith('/') && val === displayString.slice(0, -1)) {
            const nextDigits = val.slice(0, -1).replace(/\D/g, '');
            const newDisplay = formatDigits(nextDigits, false);
            setDisplayString(newDisplay);
            checkAndSync(newDisplay);
            return;
        }

        const digits = val.replace(/\D/g, '').slice(0, 8);
        const newDisplay = formatDigits(digits, !isDeleting);
        setDisplayString(newDisplay);
        checkAndSync(newDisplay);
    };

    const formatDigits = (digits: string, autoSlash: boolean): string => {
        if (format === 'YYYY-MM-DD') {
            if (digits.length <= 4) return digits;
            if (digits.length <= 6) {
                return `${digits.slice(0, 4)}-${digits.slice(4)}`;
            }
            return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
        }

        // Default DD/MM/YYYY
        if (digits.length <= 2) {
            return digits.length === 2 && autoSlash ? `${digits}/` : digits;
        }
        if (digits.length <= 4) {
            const d = digits.slice(0, 2);
            const m = digits.slice(2);
            return m.length === 2 && autoSlash ? `${d}/${m}/` : `${d}/${m}`;
        }
        return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
    };

    const checkAndSync = (str: string) => {
        const parsed = parseDate(str);
        if (parsed) {
            // Check min/max constraints
            if (parsedMinDate && parsed < parsedMinDate) return;
            if (parsedMaxDate && parsed > parsedMaxDate) return;

            if (!isControlled) {
                setSelectedDate(parsed);
            }
            setViewDate(parsed);
            onChange?.(parsed, toISODate(parsed));
        } else if (str === '') {
            if (!isControlled) {
                setSelectedDate(null);
            }
            onChange?.(null, '');
        }
    };

    const handleInputBlur = () => {
        if (!displayString.trim()) {
            commitDate(null);
            return;
        }
        const parsed = parseDate(displayString);
        if (parsed) {
            commitDate(parsed);
        } else if (activeDate) {
            // Revert back to active date if typed value was invalid
            setDisplayString(formatDateDisplay(activeDate, format));
        }
    };

    // Calendar navigation
    const viewYear = viewDate.getFullYear();
    const viewMonth = viewDate.getMonth();

    const handlePrevMonth = () => {
        setViewDate(new Date(viewYear, viewMonth - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewYear, viewMonth + 1, 1));
    };

    const handlePrevYear = () => {
        setViewDate(new Date(viewYear - 1, viewMonth, 1));
    };

    const handleNextYear = () => {
        setViewDate(new Date(viewYear + 1, viewMonth, 1));
    };

    // 12-year window for year selector
    const yearWindowStart = Math.floor(viewYear / 12) * 12;
    const handlePrevYearWindow = () => {
        setViewDate(new Date(viewYear - 12, viewMonth, 1));
    };
    const handleNextYearWindow = () => {
        setViewDate(new Date(viewYear + 12, viewMonth, 1));
    };

    const handleSelectDay = (day: number, targetMonth: number, targetYear: number) => {
        const date = new Date(targetYear, targetMonth, day);
        if (parsedMinDate && date < parsedMinDate) return;
        if (parsedMaxDate && date > parsedMaxDate) return;

        commitDate(date);
        setOpen(false);
    };

    const handleSelectMonth = (m: number) => {
        setViewDate(new Date(viewYear, m, 1));
        setView('days');
    };

    const handleSelectYear = (y: number) => {
        setViewDate(new Date(y, viewMonth, 1));
        setView('months');
    };

    const handleToday = () => {
        const today = new Date();
        commitDate(today);
        setOpen(false);
    };

    const handleClear = () => {
        commitDate(null);
        setOpen(false);
    };

    // Calendar grid calculation
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();
    const firstDayWeekday = new Date(viewYear, viewMonth, 1).getDay();

    const days = React.useMemo(() => {
        const items: {
            day: number;
            month: number;
            year: number;
            isCurrentMonth: boolean;
            isSelected: boolean;
            isToday: boolean;
            isDisabled: boolean;
        }[] = [];

        const today = new Date();
        const isSameDay = (d1: Date, y: number, m: number, d: number) =>
            d1.getFullYear() === y && d1.getMonth() === m && d1.getDate() === d;

        // Previous month trailing days
        for (let i = firstDayWeekday - 1; i >= 0; i--) {
            const d = daysInPrevMonth - i;
            const m = viewMonth === 0 ? 11 : viewMonth - 1;
            const y = viewMonth === 0 ? viewYear - 1 : viewYear;
            const dateObj = new Date(y, m, d);

            items.push({
                day: d,
                month: m,
                year: y,
                isCurrentMonth: false,
                isSelected: Boolean(activeDate && isSameDay(activeDate, y, m, d)),
                isToday: isSameDay(today, y, m, d),
                isDisabled: Boolean(
                    (parsedMinDate && dateObj < parsedMinDate) ||
                    (parsedMaxDate && dateObj > parsedMaxDate)
                ),
            });
        }

        // Current month days
        for (let d = 1; d <= daysInCurrentMonth; d++) {
            const dateObj = new Date(viewYear, viewMonth, d);
            items.push({
                day: d,
                month: viewMonth,
                year: viewYear,
                isCurrentMonth: true,
                isSelected: Boolean(activeDate && isSameDay(activeDate, viewYear, viewMonth, d)),
                isToday: isSameDay(today, viewYear, viewMonth, d),
                isDisabled: Boolean(
                    (parsedMinDate && dateObj < parsedMinDate) ||
                    (parsedMaxDate && dateObj > parsedMaxDate)
                ),
            });
        }

        // Next month leading days (fill up to 42 cells for consistent height)
        const totalCells = items.length <= 35 ? 35 : 42;
        const remaining = totalCells - items.length;
        for (let d = 1; d <= remaining; d++) {
            const m = viewMonth === 11 ? 0 : viewMonth + 1;
            const y = viewMonth === 11 ? viewYear + 1 : viewYear;
            const dateObj = new Date(y, m, d);

            items.push({
                day: d,
                month: m,
                year: y,
                isCurrentMonth: false,
                isSelected: Boolean(activeDate && isSameDay(activeDate, y, m, d)),
                isToday: isSameDay(today, y, m, d),
                isDisabled: Boolean(
                    (parsedMinDate && dateObj < parsedMinDate) ||
                    (parsedMaxDate && dateObj > parsedMaxDate)
                ),
            });
        }

        return items;
    }, [viewYear, viewMonth, firstDayWeekday, daysInCurrentMonth, daysInPrevMonth, activeDate, parsedMinDate, parsedMaxDate]);

    return (
        <div className={cn('relative flex items-center w-full', className)}>
            {/* Hidden input for standard HTML form submission in ISO YYYY-MM-DD */}
            {name && (
                <input
                    type="hidden"
                    name={name}
                    value={activeDate ? toISODate(activeDate) : ''}
                />
            )}

            <Popover open={open} onOpenChange={setOpen}>
                <div className="relative w-full">
                    <input
                        type="text"
                        id={id}
                        inputMode="numeric"
                        disabled={disabled}
                        readOnly={readOnly}
                        required={required}
                        placeholder={placeholder || (format === 'YYYY-MM-DD' ? 'YYYY-MM-DD' : 'DD/MM/YYYY')}
                        value={displayString}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        className={cn(
                            'flex h-9.5 w-full rounded-md border border-input bg-background ps-3 pe-9 py-2 text-base font-normal placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring/15 disabled:cursor-not-allowed disabled:opacity-50 md:text-xs transition-colors',
                            open && 'ring-2 ring-ring/15 border-input',
                            inputClassName
                        )}
                    />

                    <PopoverTrigger asChild>
                        <button
                            type="button"
                            disabled={disabled || readOnly}
                            tabIndex={-1}
                            className="absolute end-1.5 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground rounded-sm transition-colors disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
                            aria-label="Open calendar"
                        >
                            <CalendarIcon className="size-4" />
                        </button>
                    </PopoverTrigger>
                </div>

                <PopoverContent
                    align="end"
                    sideOffset={6}
                    className="w-[285px] p-3 text-xs bg-popover text-popover-foreground rounded-lg border border-border shadow-md select-none"
                >
                    {/* View: Days */}
                    {view === 'days' && (
                        <div>
                            {/* Header: Month / Year with Smart Popover triggers and arrows */}
                            <div className="flex items-center justify-between mb-2.5">
                                <button
                                    type="button"
                                    onClick={handlePrevMonth}
                                    className="p-1 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                    aria-label="Previous month"
                                >
                                    <ChevronLeft className="size-4" />
                                </button>

                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setView('months')}
                                        className="px-2 py-1 font-medium hover:bg-accent rounded-md text-foreground flex items-center gap-1 transition-colors cursor-pointer"
                                    >
                                        <span>{MONTH_NAMES[viewMonth]}</span>
                                        <ChevronDown className="size-3 text-muted-foreground" />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setView('years')}
                                        className="px-2 py-1 font-medium hover:bg-accent rounded-md text-foreground flex items-center gap-1 transition-colors cursor-pointer"
                                    >
                                        <span>{viewYear}</span>
                                        <ChevronDown className="size-3 text-muted-foreground" />
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleNextMonth}
                                    className="p-1 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                    aria-label="Next month"
                                >
                                    <ChevronRight className="size-4" />
                                </button>
                            </div>

                            {/* Weekday headers */}
                            <div className="grid grid-cols-7 gap-1 text-center font-medium text-muted-foreground text-[11px] mb-1.5">
                                {WEEKDAY_NAMES.map((wd) => (
                                    <div key={wd} className="py-0.5">
                                        {wd}
                                    </div>
                                ))}
                            </div>

                            {/* Days grid */}
                            <div className="grid grid-cols-7 gap-1 text-center">
                                {days.map((item, idx) => {
                                    return (
                                        <button
                                            key={idx}
                                            type="button"
                                            disabled={item.isDisabled}
                                            onClick={() => handleSelectDay(item.day, item.month, item.year)}
                                            className={cn(
                                                'h-7.5 w-7.5 mx-auto rounded-md text-xs flex items-center justify-center transition-colors cursor-pointer',
                                                item.isSelected
                                                    ? 'bg-primary-color text-primary-color-foreground font-semibold hover:bg-primary-color/90'
                                                    : item.isToday
                                                        ? 'border border-primary-color text-primary-color font-semibold hover:bg-primary-color/10'
                                                        : item.isCurrentMonth
                                                            ? 'text-foreground hover:bg-accent hover:text-accent-foreground'
                                                            : 'text-muted-foreground/35 hover:bg-accent/40 hover:text-muted-foreground',
                                                item.isDisabled && 'opacity-30 pointer-events-none cursor-not-allowed'
                                            )}
                                        >
                                            {item.day}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* View: Months */}
                    {view === 'months' && (
                        <div>
                            <div className="flex items-center justify-between mb-2.5">
                                <button
                                    type="button"
                                    onClick={handlePrevYear}
                                    className="p-1 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                    aria-label="Previous year"
                                >
                                    <ChevronLeft className="size-4" />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setView('years')}
                                    className="px-2 py-1 font-medium hover:bg-accent rounded-md text-foreground flex items-center gap-1 transition-colors cursor-pointer"
                                >
                                    <span>{viewYear}</span>
                                    <ChevronDown className="size-3 text-muted-foreground" />
                                </button>

                                <button
                                    type="button"
                                    onClick={handleNextYear}
                                    className="p-1 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                    aria-label="Next year"
                                >
                                    <ChevronRight className="size-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-2 py-1">
                                {MONTH_NAMES_SHORT.map((mName, mIdx) => {
                                    const isCurrent = mIdx === viewMonth;
                                    return (
                                        <button
                                            key={mName}
                                            type="button"
                                            onClick={() => handleSelectMonth(mIdx)}
                                            className={cn(
                                                'py-2 px-1 text-xs rounded-md transition-colors font-normal cursor-pointer text-center',
                                                isCurrent
                                                    ? 'bg-primary-color text-primary-color-foreground font-medium'
                                                    : 'hover:bg-accent hover:text-accent-foreground text-foreground'
                                            )}
                                        >
                                            {mName}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* View: Years */}
                    {view === 'years' && (
                        <div>
                            <div className="flex items-center justify-between mb-2.5">
                                <button
                                    type="button"
                                    onClick={handlePrevYearWindow}
                                    className="p-1 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                    aria-label="Previous 12 years"
                                >
                                    <ChevronsLeft className="size-4" />
                                </button>

                                <span className="text-xs font-medium text-foreground">
                                    {yearWindowStart} - {yearWindowStart + 11}
                                </span>

                                <button
                                    type="button"
                                    onClick={handleNextYearWindow}
                                    className="p-1 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                    aria-label="Next 12 years"
                                >
                                    <ChevronsRight className="size-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-2 py-1">
                                {Array.from({ length: 12 }, (_, i) => yearWindowStart + i).map((y) => {
                                    const isCurrent = y === viewYear;
                                    return (
                                        <button
                                            key={y}
                                            type="button"
                                            onClick={() => handleSelectYear(y)}
                                            className={cn(
                                                'py-2 px-1 text-xs rounded-md transition-colors font-normal cursor-pointer text-center',
                                                isCurrent
                                                    ? 'bg-primary-color text-primary-color-foreground font-medium'
                                                    : 'hover:bg-accent hover:text-accent-foreground text-foreground'
                                            )}
                                        >
                                            {y}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Bottom Toolbar: Today & Clear */}
                    <div className="flex items-center justify-between border-t border-border pt-2 mt-2">
                        <button
                            type="button"
                            onClick={handleClear}
                            className="text-[11px] text-muted-foreground hover:text-foreground font-light px-2 py-1 rounded hover:bg-accent transition-colors cursor-pointer"
                        >
                            Clear
                        </button>

                        <button
                            type="button"
                            onClick={handleToday}
                            className="text-[11px] text-primary-color hover:underline font-medium px-2 py-1 rounded hover:bg-primary-color/10 transition-colors cursor-pointer"
                        >
                            Today
                        </button>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}

export default DatePicker;

