import { TableBody } from "@/components/ui/table";
import DataTableRow from "./row";
import Config from "@/types/config-type";

export default function DataTableBody({ config, data }: { config: Config, data: any[] }) {
    return (
        <TableBody>
            {data.map((item, index) => (
                <DataTableRow key={index} config={config} item={item} />
            ))}
        </TableBody>
    );
}