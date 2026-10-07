import { Badge } from "@/components/ui/badge";
import type { KanbanConfig } from "@/types/config-type";

export default function KanbanCard({ item, kanbanConfig }: { item: any, kanbanConfig: KanbanConfig, }) {
    return (
        <div key={item.id} className="border border-accent p-3 rounded-lg bg-background hover:ring-2 ring-0 ring-accent cursor-pointer">
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
    );
}