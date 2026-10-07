import Config, { Column } from "@/types/config-type";

export const columns: Column[] = [
    {
        key: "id",
        title: "ID",
    },
    {
        key: "name",
        title: "Name",
    },
    {
        key: "email",
        title: "Email",
    },
    {
        key: "phone",
        title: "Phone",
    },
    {
        key: "balance",
        title: "Balance",
        type: "currency",
    },
    {
        key: "address",
        title: "Address",
    },
    {
        key: "created_at",
        title: "Created At",
        type: "date",
    },
    {
        key: "updated_at",
        title: "Updated At",
        type: "date",
    },
];

const config: Config = {
    title: "Module",
    pluralTitle: "Modules",

    modelName: "module",

    createLabel: "Create Module",

    // editLabel: "Edit Module",
    // showLabel: "Show Module",
    // deleteLabel: "Delete Module",
    // deleteConfirmTitle: "Delete Module",
    // deleteConfirmMessage: "Are you sure you want to delete this module?",
    // deleteSuccessMessage: "Module deleted successfully",
    // deleteErrorMessage: "Failed to delete module",

    createable: true,
    duplicateable: true,
    editable: true,
    showable: true,
    deletable: true,

    viewTypes: ["table", "kanban"],
    columns: columns,
};

export default config;
