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
import { Copy, Eye, Loader2, MoreVertical, Pencil, Trash2 } from "lucide-react";
import DataTableCell from "./cell";
import Config from "@/types/config-type";
import useSelection from "@/hooks/resource-page/use-selection";
import useDrawerSync from "@/hooks/resource-page/use-drawer-sync";
import { Link } from "@inertiajs/react";
import { useResource } from "@/hooks/resource-page/use-resource";
import { cn } from "@/lib/utils";
import { useDialog } from "@/components/providers/dialog-provider";



export default function DataTableRow({ config, item }: { config: Config, item: any }) {
    const dialog = useDialog();
    const resource = useResource({ resource: config.modelName });

    const { isSelected, toggle } = useSelection();

    const { open } = useDrawerSync();

    const handleRowClick = (e: React.MouseEvent) => {
        if (!config.rowDrawer && !config.onRowClick) return;


        if (e.detail > 1) return;

        const selectionText = window.getSelection()?.toString();
        if (selectionText && selectionText.trim().length > 0) return;

        const target = e.target as HTMLElement;
        if (target.closest('[data-prevent-click="true"], button, a, input, [role="checkbox"], [role="menu"],[role="button"]') || target.closest('.action-cell')) return;

        if (config.rowDrawer) {
            open(item);
        }
        if (config.onRowClick) {
            config.onRowClick(item);
        }
    }

    const handleRowDelete = async () => {
        const confirm = await dialog.confirm({
            title: `Delete ${config.title || "Item"}`,
            description: `Are you sure you want to delete this ${config.title}?\n This Data cannot be restored again.`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            variant: 'destructive'
        });

        if (confirm) {
            resource.destroy(item.id);
        }

    }

    return (
        <TableRow onClick={handleRowClick} className={cn(
            "group transition-all duration-300",
            resource.processing && "opacity-50 blur-[1px] pointer-events-no,ne",
            config.onRowClick || config.rowDrawer ? "cursor-pointer" : ""
        )}>

            <TableCell className="w-16">
                {(
                    resource.processing ? (
                        <Loader2 className="size-3 mx-1 animate-spin text-muted-foreground" />
                    ) : (
                        <Checkbox
                            id={`resource-select-${config.modelName}-${item.id}`}
                            checked={isSelected(item.id)}
                            onCheckedChange={() => toggle(item.id)}
                            className="size-4.5!" />

                    )
                )}
            </TableCell>

            {config.columns.map((column) => (
                <DataTableCell key={column.key} column={column} value={column.value ? (typeof column.value === 'function' ? column.value(item) : column.value) : item[column.key]} />
            ))}
            <TableCell className="action-cell">
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
                            {config.editable && <DropdownMenuItem asChild>
                                <Link href={route(`${config.modelName}.edit`, item.id)}>
                                    <Pencil className="opacity-50" />
                                    {config.editLabel || `Edit`}
                                </Link>
                            </DropdownMenuItem>}

                            {config.duplicateable && <DropdownMenuItem onClick={() => resource.clone(item.id)} disabled={resource.processing}>
                                <Copy className="opacity-50" />
                                {config.duplicateLabel || `Duplicate`}
                            </DropdownMenuItem>}

                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            {config.deletable && <DropdownMenuItem className="text-destructive hover:bg-red-500/10! hover:text-destructive!" onClick={handleRowDelete} disabled={resource.processing}>
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