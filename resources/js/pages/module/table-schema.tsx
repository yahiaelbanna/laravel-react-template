import { Column } from "@/types/config-type";

export const columns: Column[] = [
    {
        key: "id",
        title: "ID",
    },
    {
        key: "name",
        title: "Name",
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
