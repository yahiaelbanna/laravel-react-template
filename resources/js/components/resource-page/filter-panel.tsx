import type Config from "@/types/config-type";
import useFilterPanel from "@/hooks/resource-page/use-filter-panel";
import FieldRenderer from "../renderer/field-renderer";
import { Button } from "../ui/button";
import { useQuery } from "@/hooks/resource-page/use-query";
import { useForm } from "@inertiajs/react";
import { FormEvent } from "react";

export default function FilterPanel({ config }: { config: Config }) {
    const { panel } = useFilterPanel();

    const fields = config.filters;
    const query = useQuery();
    const form = useForm(query.data);

    const handleApply = (e: FormEvent) => {
        e.preventDefault();
        query.update(form.data, { resetPage: true });
    }
    const handleReset = () => {
        form.reset();
        query.reset();
    }

    return (
        <div
            className={`shrink-0 overflow-hidden truncate border-e border-accent/70 transition-[width] duration-300 ease-out ${panel ? 'w-72' : 'w-0 border-e-0'}`}
        >
            <form className="flex flex-col h-0 min-h-full w-72" onSubmit={handleApply}>
                <div className="shrink-0">
                    <h3 className="text-sm font-light bg-muted-foreground/5 p-2.5 border-b">
                        Filter Panel
                    </h3>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
                    <div className="p-3.5 pt-4 space-y-4">
                        {fields?.map((field, index) => (
                            <div key={`${field.key}-${index}`}>
                                <FieldRenderer
                                    field={field}
                                    value={form.data[field.key] ?? ""}
                                    onChange={(val) => form.setData(field.key, val)}
                                    error={form.errors[field.key]}
                                    labelClass="text-muted-foreground text-xs" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="shrink-0 p-3.5 flex gap-2 items-center border-t bg-background">
                    <Button className="w-2/3 h-9" type="submit">Apply</Button>
                    <Button variant="outline" className="w-1/3 h-9.5" type="reset" onClick={handleReset}>
                        Reset
                    </Button>
                </div>
            </form>
        </div >
    );
}
