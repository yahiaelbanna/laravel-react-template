

import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { Head } from "@inertiajs/react";
import ToolBar from "./tool-bar";
import DataTable from "./data-table/data-table";
import Config from "@/types/config-type";
import useViewType from "@/hooks/resource-page/use-view-type";
import KanbanView from "./kanban/kanban";
import FilterPanel from "./filter-panel";
import useSelection from "@/hooks/resource-page/use-selection";
import ActionBar from "./action-bar";
import useDrawerSync from "@/hooks/resource-page/use-drawer-sync";
import RowDrawer from "./row-drawer";

export default function ResourcePage({ config, data, actions }: { config: Config, data: any[], actions: any }) {

    const { viewType } = useViewType({ viewTypes: config.viewTypes });

    const { count } = useSelection();

    const { selectedRow } = useDrawerSync();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: String(config.pluralTitle),
            href: route(`${config.modelName}.index`),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={String(config.pluralTitle)} />

            {/* Tool Bar Section Start */}
            <div className="border-y min-h-15.5 overflow-hidden relative">
                <div className={`absolute w-full transition-all duration-500 ease-in-out ${count > 0 ? '-top-full' : 'top-0'} `} >

                    <ToolBar config={config} />

                    <ActionBar config={config} actions={actions} />

                </div>
            </div>
            {/* Tool Bar Section End */}

            {/* Table Section Start */}

            <div className={`w-full h-full flex`}>
                {config.filters && (
                    <FilterPanel config={config} />
                )}
                <div className="flex-1 min-h-0 h-full relative overflow-hidden">
                    {viewType == "table" && <DataTable config={config} data={data} />}
                    {viewType == "kanban" && <KanbanView config={config} data={data} />}
                </div>
            </div>
            {/* Table Section End */}

            {selectedRow && <RowDrawer config={config} />}
        </AppLayout >
    );
}