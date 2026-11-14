import type * as React from "react";
import type { CropConfig, MediaUploaderLabels, UploadHandler, VideoConfig } from "@/components/media-uploader";

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
    defaultValue?: any;
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

export type InputGroupConfig = BaseFieldConfig & {
    type: "inputGroup";
    addon: String | React.ReactNode;
    addonAlign?: "start" | "end";
};

export type DateFieldConfig = BaseFieldConfig & {
    type: "date";
    format?: "DD/MM/YYYY" | "YYYY-MM-DD" | string;
    minDate?: string | Date;
    maxDate?: string | Date;
};

export type RepeaterLayout = "table" | "card";

export type RepeaterFieldConfig = BaseFieldConfig & {
    type: "repeater";
    fields: FieldConfig[];
    layout?: RepeaterLayout;
    columns?: 1 | 2 | 3 | 4;
    addButtonText?: string;
    emptyText?: string;
    minItems?: number;
    maxItems?: number;
    itemTitle?: string | ((index: number, item: Record<string, any>) => string);
};

export type ApiSelectConfig<T> = BaseFieldConfig & {
    type: "apiSelect";
    getOptionLabel: (item: T) => string | React.ReactNode;
    getOptionValue: (item: T) => string;
    options: ApiOptionsType;
    multiple?: boolean;
};

export type ApiOptionsType = {
    endpoint: string;
    page?: number;
    pageSize?: number;
    search?: string;
    query?: Record<string, unknown>;
    sort?: string;
    orderBy?: "asc" | "desc";
    signal?: AbortSignal;
};

export type SelectOption = {
    label: string;
    value: string;
    disabled?: boolean;
};

export type MediaFieldConfig = BaseFieldConfig & {
    type: "media";
    accept?: string;
    multiple?: boolean;
    maxFiles?: number;
    maxSize?: number;
    preventDuplicates?: boolean;
    crop?: CropConfig;
    video?: VideoConfig;
    uploadHandler?: UploadHandler;
    autoUpload?: boolean;
    uploadConcurrency?: number;
    labels?: MediaUploaderLabels;
};

export type FieldConfig =
    | StandardFieldConfig
    | SelectFieldConfig
    | ApiSelectConfig<any>
    | InputGroupConfig
    | DateFieldConfig
    | RepeaterFieldConfig
    | MediaFieldConfig;

export type ResourceForm = FormSection[];

export type FiledType = StandardFieldType | SelectFieldType | "apiSelect" | "inputGroup" | "date" | "repeater" | "media";
export type FieldType = FiledType;
