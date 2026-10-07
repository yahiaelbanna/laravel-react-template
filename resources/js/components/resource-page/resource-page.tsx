

import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { Head } from "@inertiajs/react";
import ToolBar from "./tool-bar";
import DataTable from "./data-table/data-table";
import Config from "@/types/config-type";
import useFilterPanel from "@/hooks/resource-page/use-filter-panel";

export default function ResourcePage({ config, data }: { config: Config, data: any[] }) {
    const { panel } = useFilterPanel();

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
                {/* {panel && ( */}
                <div className={`h-full shrink-0 transition-all duration-300 ease-out overflow-hidden truncate border-accent/70 border-0 ${panel ? 'w-72 border-e' : 'w-0'}`}>
                    <h3 className="text-sm font-light bg-muted-foreground/5 p-2.5 border-accent/70 border-b">Filter Panel</h3>
                </div>
                {/* )} */}
                <div className="flex-1 min-h-0 h-full relative overflow-hidden">
                    <DataTable config={config} data={data} />
                </div>
            </div>
            {/* Table Section End */}
        </AppLayout>
    );
}