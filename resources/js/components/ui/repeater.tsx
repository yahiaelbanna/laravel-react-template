import * as React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { RepeaterFieldConfig } from '@/types/form-config-type';
import FieldRenderer from '../renderer/field-renderer';

export interface RepeaterProps {
    field: RepeaterFieldConfig;
    value?: any;
    defaultValue?: any;
    onChange?: (value: Record<string, any>[]) => void;
    disabled?: boolean;
    readOnly?: boolean;
    className?: string;
}

type InternalItem = Record<string, any> & { _rowId: string };

function generateRowId(): string {
    return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

function parseRepeaterValue(val: unknown): InternalItem[] {
    if (!val) return [];
    let parsedArray: any[] = [];

    if (Array.isArray(val)) {
        parsedArray = val;
    } else if (typeof val === 'string') {
        const trimmed = val.trim();
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            try {
                const json = JSON.parse(trimmed);
                if (Array.isArray(json)) {
                    parsedArray = json;
                }
            } catch {
                parsedArray = [];
            }
        }
    }

    return parsedArray.map((item) => {
        const base = typeof item === 'object' && item !== null ? item : { value: item };
        return {
            ...base,
            _rowId: base._rowId || generateRowId(),
        };
    });
}

function cleanItems(items: InternalItem[]): Record<string, any>[] {
    return items.map(({ _rowId, ...rest }) => rest);
}

export function Repeater({
    field,
    value,
    defaultValue,
    onChange,
    disabled = false,
    readOnly = false,
    className,
}: RepeaterProps) {
    const isControlled = value !== undefined;

    const [internalItems, setInternalItems] = React.useState<InternalItem[]>(() => {
        return parseRepeaterValue(value !== undefined ? value : (defaultValue ?? field.defaultValue));
    });

    // Synchronize when controlled value changes externally
    React.useEffect(() => {
        if (isControlled) {
            setInternalItems(parseRepeaterValue(value));
        }
    }, [value, isControlled]);

    const items = isControlled ? parseRepeaterValue(value) : internalItems;

    const emitChange = (newItems: InternalItem[]) => {
        if (!isControlled) {
            setInternalItems(newItems);
        }
        onChange?.(cleanItems(newItems));
    };

    const handleAddRow = () => {
        if (disabled || readOnly) return;
        if (field.maxItems && items.length >= field.maxItems) return;

        const newItem: InternalItem = {
            _rowId: generateRowId(),
        };

        // Initialize child field default values
        field.fields?.forEach((f) => {
            const isMulti = f.type === 'multi-select' || (f.type === 'apiSelect' && (f as any).multiple);
            const isChildRepeater = f.type === 'repeater';
            const fallback = isChildRepeater ? [] : (isMulti ? [] : '');
            newItem[f.key] = f.defaultValue ?? fallback;
        });

        emitChange([...items, newItem]);
    };

    const handleDeleteRow = (index: number) => {
        if (disabled || readOnly) return;
        if (field.minItems && items.length <= field.minItems) return;

        const newItems = items.filter((_, i) => i !== index);
        emitChange(newItems);
    };

    const handleFieldChange = (rowIndex: number, fieldKey: string, newVal: any) => {
        if (disabled || readOnly) return;

        const newItems = items.map((item, idx) => {
            if (idx === rowIndex) {
                return {
                    ...item,
                    [fieldKey]: newVal,
                };
            }
            return item;
        });

        emitChange(newItems);
    };

    const layout = field.layout ?? 'table';
    const canAdd = !disabled && !readOnly && (!field.maxItems || items.length < field.maxItems);
    const canDelete = !disabled && !readOnly && (!field.minItems || items.length > field.minItems);

    const resolveItemTitle = (index: number, row: InternalItem): string => {
        if (typeof field.itemTitle === 'function') {
            return field.itemTitle(index, cleanItems([row])[0]);
        }
        if (typeof field.itemTitle === 'string') {
            return `${field.itemTitle} #${index + 1}`;
        }
        return `Item #${index + 1}`;
    };

    const gridColSpan: Record<number, string> = {
        1: 'col-span-1',
        2: 'col-span-2',
        3: 'col-span-3',
        4: 'col-span-4',
    };

    const gridCols: Record<number, string> = {
        1: 'md:grid-cols-1',
        2: 'md:grid-cols-2',
        3: 'md:grid-cols-3',
        4: 'md:grid-cols-4',
    };

    // -------------------------------------------------------------
    // Table Layout
    // -------------------------------------------------------------
    if (layout === 'table') {
        return (
            <div className={cn('w-full border border-border rounded-lg bg-background overflow-hidden shadow-xs', className)}>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-start border-collapse">
                        <thead>
                            <tr className="bg-muted/50 border-b border-border text-muted-foreground font-medium">
                                <th className="w-10 px-3 py-2 text-center select-none">#</th>
                                {field.fields?.map((childField) => (
                                    <th key={childField.key} className="px-3 py-2 text-start font-medium min-w-[140px]">
                                        <span>{childField.label || childField.key}</span>
                                        {childField.required && <span className="text-red-400 ms-0.5">*</span>}
                                    </th>
                                ))}
                                <th className="w-12 px-2 py-2 text-center"></th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-border">
                            {items.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={(field.fields?.length ?? 0) + 2}
                                        className="text-center py-8 text-xs text-muted-foreground"
                                    >
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <span>{field.emptyText || 'No items added yet.'}</span>
                                            {canAdd && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="xs"
                                                    onClick={handleAddRow}
                                                    className="gap-1 cursor-pointer"
                                                >
                                                    <Plus className="size-3.5" />
                                                    {field.addButtonText || 'Add Row'}
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                items.map((row, rowIndex) => (
                                    <tr key={row._rowId} className="hover:bg-muted/15 transition-colors">
                                        <td className="px-3 py-2 text-center text-muted-foreground font-mono text-[11px] align-middle select-none">
                                            {rowIndex + 1}
                                        </td>

                                        {field.fields?.map((childField) => (
                                            <td key={childField.key} className="px-2 py-1.5 align-middle">
                                                <FieldRenderer
                                                    field={{
                                                        ...childField,
                                                        key: `${field.key}_${rowIndex}_${childField.key}`,
                                                    }}
                                                    hideLabel={true}
                                                    value={row[childField.key]}
                                                    onChange={(val) => handleFieldChange(rowIndex, childField.key, val)}
                                                />
                                            </td>
                                        ))}

                                        <td className="px-2 py-1.5 text-center align-middle">
                                            {canDelete && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon-xs"
                                                    onClick={() => handleDeleteRow(rowIndex)}
                                                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                                                    title="Delete row"
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {items.length > 0 && (
                    <div className="p-2.5 border-t border-border bg-muted/20 flex items-center justify-between">
                        {canAdd ? (
                            <Button
                                type="button"
                                variant="outline"
                                size="xs"
                                onClick={handleAddRow}
                                className="gap-1.5 text-xs cursor-pointer"
                            >
                                <Plus className="size-3.5" />
                                {field.addButtonText || 'Add Row'}
                            </Button>
                        ) : <div />}

                        <span className="text-[11px] text-muted-foreground select-none">
                            {items.length} {items.length === 1 ? 'row' : 'rows'}
                        </span>
                    </div>
                )}
            </div>
        );
    }

    // -------------------------------------------------------------
    // Card Layout
    // -------------------------------------------------------------
    return (
        <div className={cn('w-full space-y-3', className)}>
            {items.length === 0 ? (
                <div className="border border-dashed border-border rounded-lg p-8 text-center text-muted-foreground text-xs bg-muted/10">
                    <div className="flex flex-col items-center justify-center gap-2">
                        <span>{field.emptyText || 'No items added yet.'}</span>
                        {canAdd && (
                            <Button
                                type="button"
                                variant="outline"
                                size="xs"
                                onClick={handleAddRow}
                                className="gap-1 cursor-pointer"
                            >
                                <Plus className="size-3.5" />
                                {field.addButtonText || 'Add Item'}
                            </Button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {items.map((row, rowIndex) => (
                        <div
                            key={row._rowId}
                            className="rounded-lg border border-border bg-card shadow-xs overflow-hidden transition-all"
                        >
                            {/* Card Header */}
                            <div className="flex items-center justify-between px-3.5 py-2 bg-muted/40 border-b border-border text-xs font-medium">
                                <div className="flex items-center gap-2">
                                    <span className="size-5 rounded-full bg-primary-color/10 text-primary-color flex items-center justify-center text-[10px] font-semibold select-none">
                                        {rowIndex + 1}
                                    </span>
                                    <span className="font-medium text-foreground">
                                        {resolveItemTitle(rowIndex, row)}
                                    </span>
                                </div>

                                {canDelete && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon-xs"
                                        onClick={() => handleDeleteRow(rowIndex)}
                                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                                        title="Delete item"
                                    >
                                        <Trash2 className="size-3.5" />
                                    </Button>
                                )}
                            </div>

                            {/* Card Body */}
                            <div className={cn('p-3.5 grid grid-cols-1 gap-3', gridCols[field.columns ?? 2])}>
                                {field.fields?.map((childField) => (
                                    <div
                                        key={childField.key}
                                        className={gridColSpan[childField.colSpan ?? 1]}
                                    >
                                        <FieldRenderer
                                            field={{
                                                ...childField,
                                                key: `${field.key}_${rowIndex}_${childField.key}`,
                                            }}
                                            hideLabel={false}
                                            value={row[childField.key]}
                                            onChange={(val) => handleFieldChange(rowIndex, childField.key, val)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {items.length > 0 && canAdd && (
                <div className="pt-1">
                    <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={handleAddRow}
                        className="gap-1.5 text-xs cursor-pointer"
                    >
                        <Plus className="size-3.5" />
                        {field.addButtonText || 'Add Item'}
                    </Button>
                </div>
            )}
        </div>
    );
}

export default Repeater;

