import type { DateFieldConfig, FieldConfig } from "@/types/form-config-type";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Info } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import MultiSelect from "../ui/multi-select";
import ApiSelect from "../ui/api-select";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";
import DatePicker from "../ui/date-picker";
import InputError from "../input-error";

export interface FieldRendererProps {
    field: FieldConfig;
    labelClass?: string;
    value?: any;
    onChange?: (value: any) => void;
    error?: string;
}

export default function FieldRenderer({
    field,
    labelClass,
    value,
    onChange,
    error,
}: FieldRendererProps) {
    const attributes = {
        id: field.key,
        name: field.key,
        placeholder: field.placeholder,
        required: field.required,
        disabled: field.disabled,
        readOnly: field.readonly,
        className: field.className,
    };

    return (
        <FieldContainer field={field} labelClass={labelClass} error={error}>
            {
                (() => {
                    switch (field.type) {
                        case "text":
                            return (
                                <Input
                                    type="text"
                                    {...attributes}
                                    value={value !== undefined ? value : (field.defaultValue ?? "")}
                                    onChange={(e) => onChange?.(e.target.value)}
                                    aria-invalid={!!error}
                                />
                            );
                        case "email":
                            return (
                                <Input
                                    type="email"
                                    inputMode="email"
                                    {...attributes}
                                    value={value !== undefined ? value : (field.defaultValue ?? "")}
                                    onChange={(e) => onChange?.(e.target.value)}
                                    aria-invalid={!!error}
                                />
                            );
                        case "number":
                            return (
                                <Input
                                    type="number"
                                    inputMode="numeric"
                                    {...attributes}
                                    value={value !== undefined ? value : (field.defaultValue ?? "")}
                                    onChange={(e) => onChange?.(e.target.value)}
                                    aria-invalid={!!error}
                                />
                            );
                        case "textArea":
                            return (
                                <Textarea
                                    {...attributes}
                                    defaultValue={value !== undefined ? value : (field.defaultValue ?? "")}
                                    onChange={(e) => onChange?.(e.target.value)}
                                    aria-invalid={!!error}
                                />
                            );
                        case "date": {
                            const dateField = field as DateFieldConfig;
                            return (
                                <DatePicker
                                    {...attributes}
                                    value={value}
                                    defaultValue={field.defaultValue as string | Date}
                                    onChange={(_date, formattedStr) => onChange?.(formattedStr)}
                                    format={dateField.format}
                                    minDate={dateField.minDate}
                                    maxDate={dateField.maxDate}
                                />
                            );
                        }
                        case "select": {
                            const selectVal = value !== undefined
                                ? (value === null ? "" : String(value))
                                : (field.defaultValue?.toString() ?? "");

                            return (
                                <Select
                                    value={selectVal}
                                    onValueChange={(val) => onChange?.(val)}
                                    disabled={field.disabled}
                                    required={field.required}
                                >
                                    <SelectTrigger className="w-full" id={field.key} aria-invalid={!!error}>
                                        <SelectValue placeholder={field.placeholder} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {field.options.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            );
                        }
                        case "multi-select":
                            return (
                                <MultiSelect
                                    options={field.options}
                                    value={value}
                                    defaultValue={field.defaultValue as any}
                                    onChange={(vals) => onChange?.(vals)}
                                    {...attributes}
                                />
                            );
                        case "apiSelect":
                            return (
                                <ApiSelect
                                    field={field}
                                    value={value}
                                    // defaultValue={field.defaultValue}
                                    onChange={(val) => onChange?.(val)}
                                />
                            );
                        case "inputGroup":
                            return (
                                <InputGroup>
                                    <InputGroupInput
                                        type="text"
                                        {...attributes}
                                        value={value !== undefined ? value : (field.defaultValue ?? "")}
                                        onChange={(e) => onChange?.(e.target.value)}
                                        aria-invalid={!!error}
                                    />
                                    <InputGroupAddon align={field.addonAlign === "start" ? "inline-start" : "inline-end"}>
                                        {field.addon}
                                    </InputGroupAddon>
                                </InputGroup>
                            );
                        default:
                            return (
                                <Input
                                    type="text"
                                    {...attributes}
                                    value={value !== undefined ? value : (field.defaultValue ?? "")}
                                    onChange={(e) => onChange?.(e.target.value)}
                                    aria-invalid={!!error}
                                />
                            );
                    }
                })()
            }
        </FieldContainer>
    );
}

function FieldContainer({
    field,
    children,
    labelClass,
    error,
}: {
    field: FieldConfig;
    children: React.ReactNode;
    labelClass?: string;
    error?: string;
}) {
    return (
        <div className="flex flex-col max-w-164">
            <Label htmlFor={field.key} className={`py-1.5 font-light text-[12px] flex items-center ${labelClass}`}>
                {field.label}

                {field.required ? <span className="text-red-400 ms-0.5">*</span> : null}

                {field.tooltip ? (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Info className="size-3 opacity-80 ms-1.5" />
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            <p className="text-xs">{field.tooltip}</p>
                        </TooltipContent>
                    </Tooltip>
                ) : null}
            </Label>

            {children}

            {error && <InputError message={error} className="mt-1 text-xs" />}
        </div>
    );
}
