import { BulkAction, Column } from "@/types/config-type";
import { Pencil, Trash } from "lucide-react";

export const columns: Column[] = [
    {
        key: "id",
        title: "ID",
    },
    {
        key: "name",
        title: "Name",
        value: (row: any) => {
            return (
                <div className="w-fit">
                    <span className="text-primary font-semibold">{row.name.toUpperCase()}</span>
                    <p className="text-muted-foreground text-xs">{'@' + row.id}</p>
                </div>
            )
        },
    },
    {
        key: "email",
        title: "Email",
    },
    {
        key: "phone",
        title: "Phone",
    },
    {
        key: "balance",
        title: "Balance",
        type: "currency",
    },
    {
        key: "address",
        title: "Address",
    },
    {
        key: "created_at",
        title: "Created At",
        type: "date",
    },
    {
        key: "updated_at",
        title: "Updated At",
        type: "date",
    },
];

export const bulkActions: BulkAction[] = [
    {
        key: "mass-delete",
        label: "Delete",
        icon: Trash,
        variant: "destructive",
    },
    {
        key: "mass-edit",
        label: "Edit",
        icon: Pencil,
        variant: "outline",
    },
];