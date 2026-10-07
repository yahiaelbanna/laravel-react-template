import type { KanbanColumn, KanbanConfig } from "@/types/config-type";
import KanbanCard from "./card";
// import { Ghost } from "lucide-react";
import { Droppable } from "@hello-pangea/dnd";

export default function KanbanColumn({ column, columnItems, kanbanConfig }: { column: KanbanColumn, columnItems: any[], kanbanConfig: KanbanConfig, }) {
    return (
        <div key={column.id} className="border-accent/70 border min-w-94 max-w-94 shrink-0 rounded max-h-full flex flex-col">

            <div className="text-sm font-medium bg-muted/40 p-3 border-b border-border flex items-center justify-between rounded-t-lg">
                <span className="capitalize">{column.title}</span>
                <span className="text-xs font-semibold text-muted-foreground bg-background px-2 py-0.5 rounded-full border">
                    {columnItems.length}
                </span>
            </div>

            <Droppable droppableId={String(column.id)}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 p-2.5 max-h-[calc(100vh-200px)] overflow-y-auto space-y-4 transition-colors ${snapshot.isDraggingOver ? "bg-accent/15" : "bg-sidebar/70"
                            }`}
                    >
                        {columnItems.map((item, index) => (
                            <KanbanCard
                                key={item.id}
                                item={item}
                                index={index}
                                kanbanConfig={kanbanConfig}
                            />
                        ))}
                        {provided.placeholder}

                        {!columnItems?.length && !snapshot.isDraggingOver && (
                            <div className="text-center h-28 flex items-center justify-center text-muted-foreground text-xs font-mono">
                                No items
                            </div>
                        )}
                    </div>
                )}
            </Droppable>
        </div>
    );
}