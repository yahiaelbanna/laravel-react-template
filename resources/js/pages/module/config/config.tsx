import Config from "@/types/config-type";
import { bulkActions, columns } from "./table-schema";
import { kanbanConfig } from "./kanban-schema";
import { filtersSchema } from "./filters-schema";
import { rowDrawer } from "./drawer-schema";
import { formSchema } from "./form-schema";

const config: Config = {
    title: "Module",
    pluralTitle: "Modules",

    modelName: "module",

    createLabel: "Create Module",

    createable: true,
    duplicateable: true,
    editable: true,
    showable: true,
    deletable: true,

    viewTypes: ["table", "kanban"],

    columns: columns,
    kanbanSchema: kanbanConfig,

    filters: filtersSchema,
    bulkActions: bulkActions,

    rowDrawer: rowDrawer,

    form: formSchema,
};

export default config;
