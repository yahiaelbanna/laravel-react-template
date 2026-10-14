import DetailsDrawer from "@/pages/module/components/details-drawer";
import { RowDrawerConfig } from "@/types/config-type";

export const rowDrawer: RowDrawerConfig = {
    title: (row) => `Details of ${row.name}`,
    description: (row) => `ID: ${row.id}`,
    component: DetailsDrawer,
    // width: "sm:max-w-1/2",
};