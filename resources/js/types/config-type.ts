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

export default interface Config {
    title: String;
    pluralTitle: String;
    modelName: String;
    createLabel?: String;
    editLabel?: String;
    showLabel?: String;
    deleteLabel?: String;
    deleteConfirmTitle?: String;
    deleteConfirmMessage?: String;
    deleteSuccessMessage?: String;
    deleteErrorMessage?: String;
    createable?: Boolean;
    editable?: Boolean;
    showable?: Boolean;
    deletable?: Boolean;
    viewTypes?: ('table' | 'kanban')[];

    columns: Column[];
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