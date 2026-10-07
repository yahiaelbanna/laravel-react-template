import { useEffect, useMemo, useState } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import Config from "@/types/config-type";
import KanbanColumn from "./column";

export default function KanbanView({ config, data }: { config: Config, data: any[] }) {

    const kanbanConfig = config.kanbanSchema;

    const buildInitialGroups = () => {
        const groups: Record<string, any[]> = {};

        kanbanConfig.columns.forEach((column) => {
            groups[column.id] = [];
        });

        data.forEach((item) => {
            const groupValue = item[kanbanConfig.groupByKey];
            if (groups[groupValue]) {
                groups[groupValue].push(item);
            }
        });

        return groups;
    }

    const [columnsData, setColumnsData] = useState<Record<string, any[]>>(buildInitialGroups);
    useEffect(() => {
        setColumnsData(buildInitialGroups());
    }, [data, kanbanConfig]);

    const onDragEnd = (result: DropResult) => {
        const { source, destination, draggableId } = result;
        if (!destination) return;

        // if (source.droppableId === destination.droppableId && source.index === destination.index) return;
        if (source.droppableId === destination.droppableId) return;

        const sourceColId = source.droppableId;
        const destinationColId = destination.droppableId;

        const sourceList = [...(columnsData[sourceColId] || [])]
        const destinationList = sourceColId === destinationColId ? sourceList : [...(columnsData[destinationColId] || [])];

        const [movedItem] = sourceList.splice(source.index, 1);

        const UpdateItem = {
            ...movedItem,
            [kanbanConfig.groupByKey]: destinationColId,
        }

        destinationList.splice(destination.index, 0, UpdateItem);

        setColumnsData((prev) => ({
            ...prev,
            [sourceColId]: sourceList,
            [destinationColId]: destinationList,
        }));

        // TODO: Request backend to change the status of the item
    }

    // const groupedData = useMemo(() => {

    //     const groups: Record<string, any[]> = {};

    //     kanbanConfig.columns.forEach((col) => {
    //         groups[col.id] = [];
    //     });

    //     data.forEach((item) => {
    //         const groupValue = item[kanbanConfig.groupByKey];
    //         if (groups[groupValue]) {
    //             groups[groupValue].push(item);
    //         }
    //     });

    //     return groups;
    // }, [data, kanbanConfig]);

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-4 h-full overflow-y-hidden overflow-x-auto p-5">
                {kanbanConfig.columns.map((column) => {
                    const columnItems = columnsData[column.id] || [];
                    return (
                        <KanbanColumn key={column.id} column={column} columnItems={columnItems} kanbanConfig={kanbanConfig} />
                    )
                })}
            </div>
        </DragDropContext>
    );
}