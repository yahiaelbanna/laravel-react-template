import { TableBody } from "@/components/ui/table";
import DataTableRow from "./row";

export default function DataTableBody() {
    return (
        <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
                <DataTableRow key={index} />
            ))}
        </TableBody>
    );
}