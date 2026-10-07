export type Column = {
    key: string;
    title: string;
    type?: columnType;
    options?: Record<string, BadgeVariant>;
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
export default interface Config {
    title: string;
    pluralTitle: string;
    modelName: string;

    createLabel?: string;
    editLabel?: string;
    duplicateLabel?: string;
    showLabel?: string;
    deleteLabel?: string;

    deleteConfirmTitle?: string;
    deleteConfirmMessage?: string;
    deleteSuccessMessage?: string;
    deleteErrorMessage?: string;

    createable?: boolean;
    editable?: boolean;
    duplicateable?: boolean;
    showable?: boolean;
    deletable?: boolean;

    viewTypes?: ViewTypes[];

    columns: Column[];
    kanbanSchema: KanbanConfig;
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
    "default" | "secondary" | "destructive" | "outline";

export type ViewTypes = 'table' | 'kanban';