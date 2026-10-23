
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

    rowSpan?: 1 | 2 | 3 | 4;
    colSpan?: 1 | 2 | 3 | 4;
};

export type StandardFieldType =
    | "text"
    | "email"
    | "number"
    | "date"
    | "datetime"
    | "currency"
    | "textArea";

export type StandardFieldConfig = BaseFieldConfig & {
    type: StandardFieldType;
};

export type SelectFieldType = "select" | "multi-select";

export type SelectFieldConfig = BaseFieldConfig & {
    type: SelectFieldType;
    options: SelectOption[];
};

export type SelectOption = {
    label: string;
    value: string;
    disabled?: boolean;
};

export type FieldConfig = StandardFieldConfig | SelectFieldConfig;

export type ResourceForm = FormSection[];

export type FiledType = StandardFieldType | SelectFieldType;
export type FieldType = FiledType;

