import { Checkbox } from "@/components/ui/checkbox";
import { TableCell, TableRow } from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button";
import { Copy, Eye, MoreVertical, Pencil, Trash2 } from "lucide-react";
import DataTableCell from "./cell";
import Config from "@/types/config-type";
import useSelection from "@/hooks/resource-page/use-selection";



export default function DataTableRow({ config, item }: { config: Config, item: any }) {
    const { isSelected, toggle } = useSelection();
    return (
        <TableRow>

            <TableCell>
                <Checkbox
                    id={`resource-select-${config.modelName}-${item.id}`}
                    checked={isSelected(item.id)}
                    onCheckedChange={() => toggle(item.id)}
                    className="size-4.5!" />
            </TableCell>

            {config.columns.map((column) => (
                <DataTableCell key={column.key} column={column} value={item[column.key]} />
            ))}
            <TableCell>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="p-0 size-7"><MoreVertical /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                            {/* {config.showable && <DropdownMenuItem>
                                <Eye className="opacity-50" />
                                {config.showLabel || `View`}
                            </DropdownMenuItem>} */}
                            {config.editable && <DropdownMenuItem>
                                <Pencil className="opacity-50" />
                                {config.editLabel || `Edit`}
                            </DropdownMenuItem>}
                            {config.duplicateable && <DropdownMenuItem>
                                <Copy className="opacity-50" />
                                {config.duplicateLabel || `Duplicate`}
                            </DropdownMenuItem>}
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            {config.deletable && <DropdownMenuItem className="text-destructive hover:bg-red-500/10! hover:text-destructive!">
                                <Trash2 className="opacity-50" />
                                {config.deleteLabel || `Delete`}
                            </DropdownMenuItem>}
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
}