import { Checkbox } from "@/components/ui/checkbox";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Config from "@/types/config-type";
import useSelection from "@/hooks/resource-page/use-selection";

export default function DataTableHeader({ config, rows }: { config: Config, rows: any[] }) {
    const { selected, count, selectAll, clear } = useSelection();
    return (
        <TableHeader>
            <TableRow className="hover:bg-muted-foreground/0! shadow-[0_1px_0_0_var(--sidebar-border)] sticky top-0 z-20 [&_th]:sticky [&_th]:top-0 [&_th]:bg-sidebar [&_th]:z-20">
                <TableHead>
                    <Checkbox id={`resource-select-all-${config.modelName}`} aria-label={`Select all ${config.pluralTitle}`} className="size-4.5!"
                        checked={(rows.length > 0 && count > 0) ? (count === rows.length ? true : 'indeterminate') : false}
                        onCheckedChange={(checked) => {
                            if (checked) {
                                selectAll(rows.map(r => r.id));
                            } else {
                                clear();
                            }
                        }}
                    />
                </TableHead>
                {config.columns.map((column) => (
                    <TableHead key={column.key}>{column.title}</TableHead>
                ))}
                {/* <TableHead>Name</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Attachments</TableHead>
                <TableHead>Notes</TableHead> */}
                <TableHead></TableHead>
            </TableRow>
        </TableHeader>
    );
}