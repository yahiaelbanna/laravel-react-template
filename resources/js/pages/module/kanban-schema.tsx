import { KanbanConfig } from "@/types/config-type";

export const kanbanConfig: KanbanConfig =
{
    groupByKey: "status",
    columns: [
        { id: "draft", title: "Draft" },
        { id: "published", title: "Published" },
        { id: "archived", title: "Archived" },
        { id: "trashed", title: "Trashed" },
        { id: "not-assigned", title: "Not Assigned" },
        { id: "active", title: "Active" },
    ],
    card: {
        titleKey: "name",
        codeKey: "id",
        descriptionKey: "balance",
        dateKey: "created_at",
        badgeKeys: ["status"],
    },
};