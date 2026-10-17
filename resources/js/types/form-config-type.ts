
export type FormSection = {
    key: string;
    title?: string;
    description?: string;
    className?: string;
    columns?: 1 | 2 | 3 | 4;

    fields: FieldConfig[];
}

export type BaseFieldConfig = {
    key: string;
    label?: string;
    placeholder?: string;
    defaultValue?: string | number | boolean | Date;
    required?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    tooltip?: string;
    hidden?: boolean;
    className?: string;

    type: FiledType;

    rowSpan?: 1 | 2 | 3 | 4;
    colSpan?: 1 | 2 | 3 | 4;
};


export type FieldConfig = BaseFieldConfig;

export type ResourceForm = FormSection[];

export type FiledType = "text" | "email" | "number" | "date" | "datetime" | "currency" | "textArea";
