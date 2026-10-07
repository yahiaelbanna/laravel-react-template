import Config from "@/types/config-type";
import { useMemo } from "react";
import KanbanColumn from "./column";

export default function KanbanView({ config, data }: { config: Config, data: any[] }) {

    const kanbanConfig = config.kanbanSchema;

    const groupedData = useMemo(() => {

        const groups: Record<string, any[]> = {};

        kanbanConfig.columns.forEach((col) => {
            groups[col.id] = [];
        });

        data.forEach((item) => {
            const groupValue = item[kanbanConfig.groupByKey];
            if (groups[groupValue]) {
                groups[groupValue].push(item);
            }
        });

        return groups;
    }, [data, kanbanConfig]);

    return (
        <div className="flex gap-4 h-full overflow-y-hidden overflow-x-auto p-5">
            {kanbanConfig.columns.map((column) => {
                const columnItems = groupedData[column.id] || [];
                return (
                    <KanbanColumn key={column.id} column={column} columnItems={columnItems} kanbanConfig={kanbanConfig} />
                )
            })}
        </div>
    );
}