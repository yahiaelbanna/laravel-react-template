import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import Config from "@/types/config-type";
import { Head } from "@inertiajs/react";
import { Button } from "../ui/button";
import FieldRenderer from "../renderer/field-renderer";


export default function FormResource({ config }: { config: Config }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: String(config.pluralTitle),
            href: route(`${config.modelName}.index`),
        },
        {
            title: String(config.createLabel),
            href: route(`${config.modelName}.create`),
        },
    ];

    const sections = config.form;

    const gridCols = {
        1: "md:grid-cols-1",
        2: "md:grid-cols-2",
        3: "md:grid-cols-3",
        4: "md:grid-cols-4",
        5: "md:grid-cols-5",
        6: "md:grid-cols-6",
    };

    const gridRow = {
        1: "row-span-1",
        2: "row-span-2",
        3: "row-span-3",
        4: "row-span-4",
    };

    const gridColSpan = {
        1: "col-span-1",
        2: "col-span-2",
        3: "col-span-3",
        4: "col-span-4",
    };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={String(config.createLabel)} />
            <form className="flex flex-col justify-between h-full">

                <div className="shrink-0 border-b p-3 flex items-center justify-between bg-accent/30">
                    <h2 className="font-medium">Add New {config.title}</h2>
                </div>

                <div className="h-full flex-1">
                    {sections?.map((section, index) => (
                        <div key={section.key} className="px-3">
                            {(section.title || section.description) && (
                                <div className="relative before:absolute before:w-64 before:h-[2px] before:bg-border before:-bottom-2 before:left-0 mt-3">
                                    {section.title && (
                                        <h2 className="font-medium text-sm">{section.title}</h2>
                                    )}
                                    {section.description && (
                                        <p className="font-light text-xs text-muted-foreground">{section.description}</p>
                                    )}
                                </div>
                            )}

                            <div className={`grid grid-cols-1 ${gridCols[section.columns ?? 1]}`}>
                                {section.fields?.map((field) => (
                                    <div key={`${section.key}-${field.key}-${index}`} className={`p-3 ${gridRow[field.rowSpan ?? 1]} ${gridColSpan[field.colSpan ?? 1]}`}>
                                        <FieldRenderer field={field} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="shrink-0 p-3 border-t flex gap-3 bg-accent/30">
                    <Button type="submit">Create</Button>

                    <Button type="reset" variant={"outline"}>Cancel</Button>
                </div>
            </form>
        </AppLayout>
    );
}