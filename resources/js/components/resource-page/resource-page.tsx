

import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { Head } from "@inertiajs/react";
import ToolBar from "./tool-bar";
import DataTable from "./data-table/data-table";

export default function ResourcePage() {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Module',
            href: '/module',
        },
    ];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Module" />

            {/* Tool Bar Section Start */}
            <ToolBar />
            {/* Tool Bar Section End */}

            {/* Table Section Start */}

            <div>
                <DataTable />
            </div>
            {/* Table Section End */}
        </AppLayout>
    );
}