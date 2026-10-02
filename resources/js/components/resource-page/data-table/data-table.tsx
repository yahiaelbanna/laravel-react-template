import {
    Table,
} from "@/components/ui/table"
import DataTableHeader from "./header";
import DataTableBody from "./body";
import Config from "@/types/config-type";
import NoDataFound from "./no-data-found";


export default function DataTable({ config, data }: { config: Config, data: any[] }) {
    return (
        <Table className={data.length > 0 ? "" : "h-full!"}>
            <DataTableHeader config={config} />
            {data.length > 0 ? (
                <DataTableBody config={config} data={data} />
            ) : (
                <NoDataFound config={config} />
            )}
        </Table>
    );
}