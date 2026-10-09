import Config from "@/types/config-type";
import { columns } from "./table-schema";
import { kanbanConfig } from "./kanban-schema";
import { filtersSchema } from "./filters-schema";

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
    kanbanSchema: kanbanConfig,

    filters: filtersSchema
};

export default config;
