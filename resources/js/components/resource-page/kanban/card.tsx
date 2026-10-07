import { Badge } from "@/components/ui/badge";
import type { KanbanConfig } from "@/types/config-type";
import { Draggable } from "@hello-pangea/dnd";

export default function KanbanCard({ item, index, kanbanConfig }: { item: any, index: number, kanbanConfig: KanbanConfig, }) {
    return (
        <Draggable draggableId={String(item.id)} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={provided.draggableProps.style}
                    className={`border border-accent p-3 rounded-lg bg-background transition-shadow ${snapshot.isDragging
                        ? "shadow-lg ring-2 ring-primary border-transparent opacity-95"
                        : "hover:ring-1 hover:ring-accent"
                        } cursor-grab active:cursor-grabbing`}
                >
                    {kanbanConfig.card.codeKey && (
                        <p className="text-xs text-muted-foreground/80">{item[kanbanConfig.card.codeKey]}</p>
                    )}
                    <h3 className="text-sm my-2">{item[kanbanConfig.card.titleKey]}</h3>
                    {kanbanConfig.card.descriptionKey && (
                        <p className="text-xs text-muted-foreground">{item[kanbanConfig.card.descriptionKey]}</p>
                    )}

                    <div className="flex gap-2 mt-4">
                        {kanbanConfig.card.badgeKeys?.map((key) => (
                            <Badge key={key} variant="outline" className="rounded">{item[key]}</Badge>
                        ))}
                    </div>
                </div>
            )}
        </Draggable>
    );
}