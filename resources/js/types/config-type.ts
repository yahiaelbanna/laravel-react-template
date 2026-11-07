import { LucideIcon } from "lucide-react";
import { FieldConfig, ResourceForm } from "./form-config-type";

export type Column = {
    key: string;
    title: string;
    type?: columnType;
    options?: Record<string, BadgeVariant>;
    preventDrawer?: boolean;
    value?: string | ((row: any) => React.ReactNode | string);
    // sortable?: boolean;
    // searchable?: boolean;
    // filterable?: boolean;
    // viewable?: boolean;
    // editable?: boolean;
    // creatable?: boolean;
    // displayable?: boolean;
    // format?: string;
    // renderer?: (value: any) => React.ReactNode;
}

export type KanbanColumn = {
    id: string;
    title: string;
    color?: string;
};

export type KanbanCardMapping = {
    titleKey: string;
    codeKey?: string;
    descriptionKey?: string;
    dateKey?: string;
    badgeKeys?: string[];
};

export type KanbanConfig = {
    groupByKey: string;
    columns: KanbanColumn[];
    card: KanbanCardMapping;
};



export type BulkAction = {
    key: string;
    label: string;
    icon?: LucideIcon;
    variant?: BadgeVariant;
};

export type RowDrawerConfig = {
    endpoint?: string | ((row: any) => string);
    title?: string | ((row: any) => string);
    description?: string | ((row: any) => string);
    component?: React.ComponentType<{ row: any; onClose?: () => void, loading?: boolean }>;
    width?: string;
}

export default interface Config {
    title: string;
    pluralTitle: string;
    modelName: string;

    createLabel?: string;
    editLabel?: string;
    duplicateLabel?: string;
    showLabel?: string;
    deleteLabel?: string;

    createable?: boolean;
    editable?: boolean;
    duplicateable?: boolean;
    showable?: boolean;
    deletable?: boolean;

    submitRoute?: string;
    submitMethod?: "post" | "put" | "patch";

    viewTypes?: ViewTypes[];

    columns: Column[];
    kanbanSchema: KanbanConfig;

    filters?: FieldConfig[];
    bulkActions?: BulkAction[];

    rowDrawer?: RowDrawerConfig;
    onRowClick?: (row: any) => void;

    form?: ResourceForm;
}


type columnType =
    "text"
    | "email"
    | "number"
    | "date"
    | "datetime"
    | "currency"
    | "badge";


export type BadgeVariant =
    "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" | "dark" | "ghost" | "link" | "purple" | "orange";

export type ViewTypes = 'table' | 'kanban';
