import {
    Table,
} from "@/components/ui/table"
import DataTableHeader from "./header";
import DataTableBody from "./body";


export default function DataTable() {
    return (
        <Table>
            <DataTableHeader />
            <DataTableBody />
        </Table>
    );
}