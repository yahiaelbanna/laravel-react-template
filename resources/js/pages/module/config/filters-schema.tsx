import { FieldConfig } from "@/types/config-type";

export const filtersSchema: FieldConfig[] = [
    {
        key: "name",
        label: "Name",
        placeholder: "Search with name...",
        type: "text",
    },
    {
        key: "email",
        label: "Email",
        placeholder: "Search with email...",
        type: "email",
    },
    {
        key: "balance",
        label: "Balance",
        placeholder: "Search with balance...",
        type: "number",
    },
];