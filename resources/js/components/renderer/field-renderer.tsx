import type { FieldConfig } from "@/types/form-config-type";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Info } from "lucide-react";
import { Textarea } from "../ui/textarea";

export default function FieldRenderer({ field, labelClass }: { field: FieldConfig, labelClass?: string }) {
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
        <FieldContainer field={field} labelClass={labelClass}>
            {
                (() => {
                    switch (field.type) {
                        case "text":
                            return <Input type="text" {...attributes} />;
                        case "email":
                            return <Input type="email" inputMode="email" {...attributes} />;
                        case "number":
                            return <Input type="number" inputMode="numeric" {...attributes} />;
                        case "textArea":
                            return <Textarea {...attributes} />;
                        default:
                            return <Input type="text" {...attributes} />;
                    }
                })()
            }
        </FieldContainer>
    )

}

function FieldContainer({ field, children, labelClass }: { field: FieldConfig, children: React.ReactNode, labelClass?: string }) {
    return (
        <div className="flex flex-col max-w-164">
            <Label htmlFor={field.key} className={`py-1.5 font-light text-[13px] flex items-center ${labelClass}`}>{field.label}

                {field.required ? <span className="text-red-400 ms-0.5">*</span> : null}

                {field.tooltip ? <Tooltip>
                    <TooltipTrigger asChild>
                        <Info className="size-3 opacity-80 ms-1.5" />
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        <p className="text-xs">{field.tooltip}</p>
                    </TooltipContent>
                </Tooltip> : null}

            </Label>

            {children}
        </div>
    );
}