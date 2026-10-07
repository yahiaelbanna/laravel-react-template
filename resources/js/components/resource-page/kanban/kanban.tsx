import { Badge } from "@/components/ui/badge";
import Config from "@/types/config-type";

export default function KanbanView({ config, data }: { config: Config, data: any[] }) {
    return (
        <div className="flex gap-4 h-full overflow-y-hidden overflow-x-auto p-5">
            {['draft', 'published', 'archived', 'trashed', 'not-assigned', 'active'].map((status, index) => (
                <div key={index} className="border-accent/70 border min-w-94 max-w-94 shrink-0 rounded max-h-full flex flex-col">

                    <h3 className="text-sm font-light bg-muted-foreground/5 p-2.5 border-border border-b rounded-t capitalize flex items-center gap-2">{status} <span className="text-xs font-semibold text-muted-foreground">5</span></h3>

                    <div className="flex-1 p-2.5 max-h-[calc(100vh-200px)] overflow-y-auto space-y-4 bg-sidebar">
                        {Array.from({ length: 25 }, (_, i) => (
                            <div key={i} className="border border-accent p-3 rounded-lg bg-background hover:ring-2 ring-0 ring-accent">
                                <p className="text-xs text-muted-foreground/80">SDA-1622</p>
                                <h3 className="text-sm my-2 cursor-pointer">Create a new feature for the application</h3>
                                <p className="text-xs text-muted-foreground">Due date: 12/12/2022</p>

                                <div className="flex gap-2 mt-4">
                                    <Badge variant="outline" className="rounded">Backend</Badge>
                                    <Badge variant="outline" className="rounded">Laravel</Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}