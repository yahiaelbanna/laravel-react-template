

import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { Head } from "@inertiajs/react";
import ToolBar from "./tool-bar";
import DataTable from "./data-table/data-table";
import Config from "@/types/config-type";
// import useViewType from "@/hooks/use-view-type";

export default function ResourcePage({ config, data }: { config: Config, data: any[] }) {
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

            <div className="w-full h-full">
                <DataTable config={config} data={data} />
            </div>
            {/* Table Section End */}
        </AppLayout>
    );
}