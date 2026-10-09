import type { FieldConfig } from "@/types/config-type";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Info } from "lucide-react";

export default function FieldRenderer({ field }: { field: FieldConfig }) {
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
        <FieldContainer field={field}>
            {
                (() => {
                    switch (field.type) {
                        case "text":
                            return <Input type="text" {...attributes} />;
                        case "email":
                            return <Input type="email" inputMode="email" {...attributes} />;
                        case "number":
                            return <Input type="number" inputMode="numeric" {...attributes} />;
                        default:
                            return <Input type="text" {...attributes} />;
                    }
                })()
            }
        </FieldContainer>
    )

}

function FieldContainer({ field, children }: { field: FieldConfig, children: React.ReactNode }) {
    return (
        <div className="flex flex-col">
            <Label htmlFor={field.key} className="py-1.5 font-light text-xs text-muted-foreground flex items-center">{field.label}

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