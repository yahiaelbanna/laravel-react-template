

import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { Head } from "@inertiajs/react";
import ToolBar from "./tool-bar";
import DataTable from "./data-table/data-table";
import Config from "@/types/config-type";
import useViewType from "@/hooks/resource-page/use-view-type";
import KanbanView from "./kanban/kanban";
import FilterPanel from "./filter-panel";

export default function ResourcePage({ config, data }: { config: Config, data: any[] }) {

    const { viewType } = useViewType({ viewTypes: config.viewTypes });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: String(config.pluralTitle),
            href: `/${config.modelName}`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={String(config.pluralTitle)} />

            {/* Tool Bar Section Start */}
            <ToolBar config={config} />
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
        </AppLayout>
    );
}