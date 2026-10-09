import type Config from "@/types/config-type";
import useFilterPanel from "@/hooks/resource-page/use-filter-panel";
import FieldRenderer from "../renderer/field-renderer";
import { Button } from "../ui/button";

export default function FilterPanel({ config }: { config: Config }) {
    const { panel } = useFilterPanel();

    const fields = config.filters;

    return (
        <div
            className={`shrink-0 overflow-hidden truncate border-e border-accent/70 transition-[width] duration-300 ease-out ${panel ? 'w-72' : 'w-0 border-e-0'}`}
        >
            <div className="flex flex-col h-0 min-h-full w-72">
                <div className="shrink-0">
                    <h3 className="text-sm font-light bg-muted-foreground/5 p-2.5 border-b border-accent/70">
                        Filter Panel
                    </h3>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
                    <div className="p-3.5 pt-4 space-y-4">
                        {fields?.map((field, index) => (
                            <div key={`${field.key}-${index}`}>
                                <FieldRenderer field={field} />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="shrink-0 p-3.5 flex gap-2 items-center border-t bg-background">
                    <Button className="w-2/3 h-9">Apply</Button>
                    <Button variant="outline" className="w-1/3 h-9.5">
                        Reset
                    </Button>
                </div>
            </div>
        </div>
    );
}
