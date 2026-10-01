import { Checkbox } from "@/components/ui/checkbox";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function DataTableHeader() {
    return (
        <TableHeader>
            <TableRow className="hover:bg-muted-foreground/0!">
                <TableHead><Checkbox className="size-4.5!" /></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Attachments</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead></TableHead>
            </TableRow>
        </TableHeader>
    );
}