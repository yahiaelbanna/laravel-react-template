import * as React from "react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import Config from "@/types/config-type";
import { Head, Link, useForm } from "@inertiajs/react";
import { Button } from "../ui/button";
import FieldRenderer from "../renderer/field-renderer";
import { Loader2 } from "lucide-react";

export interface FormResourceProps {
    config: Config;
    initialData?: Record<string, any>;
    isEdit?: boolean;
    submitRoute?: string;
    submitUrl?: string;
    submitMethod?: "post" | "put" | "patch";
    submitParams?: any;
    onSuccess?: (page?: any) => void;
    onError?: (errors: any) => void;
    cancelHref?: string;
    className?: string;
}

export default function FormResource({
    config,
    initialData,
    isEdit,
    submitRoute,
    submitUrl,
    submitMethod,
    submitParams,
    onSuccess,
    onError,
    cancelHref,
    className,
}: FormResourceProps) {
    // Determine whether this is edit mode or create mode
    const isEditMode = isEdit !== undefined
        ? isEdit
        : Boolean(initialData && (initialData.id !== undefined || Object.keys(initialData).length > 0));

    const pageTitle = isEditMode
        ? (config.editLabel || `Edit ${config.title}`)
        : (config.createLabel || `Create ${config.title}`);

    const headerTitle = isEditMode
        ? (config.editLabel || `Edit ${config.title}`)
        : (config.createLabel || `Add New ${config.title}`);

    // Compute initial form data from config schema and initialData
    const computeInitialData = React.useCallback(() => {
        const values: Record<string, any> = {};

        // Extract default values from form schema
        config.form?.forEach((section) => {
            section.fields?.forEach((field) => {
                const isMulti = field.type === "multi-select" || (field.type === "apiSelect" && (field as any).multiple);
                const fallback = isMulti ? [] : "";
                values[field.key] = field.defaultValue ?? fallback;
            });
        });

        // Overlay initialData if provided (e.g. edit page)
        if (initialData) {
            Object.keys(initialData).forEach((key) => {
                values[key] = initialData[key];
            });
        }

        return values;
    }, [config.form, initialData]);

    const { data, setData, post, put, patch, processing, errors } = useForm<Record<string, any>>(computeInitialData());

    // Sync form state if initialData changes externally
    React.useEffect(() => {
        if (initialData) {
            setData((prev: any) => ({ ...prev, ...initialData }));
        }
    }, [initialData]);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: "Dashboard",
            href: "/dashboard",
        },
        {
            title: String(config.pluralTitle),
            href: typeof route === "function" && route().has(`${config.modelName}.index`)
                ? route(`${config.modelName}.index`)
                : `/${config.modelName}`,
        },
        {
            title: String(pageTitle),
            href: isEditMode && (initialData?.id ?? data?.id)
                ? (typeof route === "function" && route().has(`${config.modelName}.edit`)
                    ? route(`${config.modelName}.edit`, initialData?.id ?? data?.id)
                    : "#")
                : (typeof route === "function" && route().has(`${config.modelName}.create`)
                    ? route(`${config.modelName}.create`)
                    : "#"),
        },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const recordId = initialData?.id ?? data?.id;
        let targetUrl: string;

        const customRoute = submitRoute ?? submitUrl ?? config.submitRoute;

        if (customRoute) {
            if (customRoute.startsWith("/") || customRoute.startsWith("http")) {
                targetUrl = customRoute;
            } else if (typeof route === "function") {
                targetUrl = route(customRoute, submitParams ?? (isEditMode ? recordId : undefined));
            } else {
                targetUrl = customRoute;
            }
        } else {
            const defaultRouteName = isEditMode
                ? `${config.modelName}.update`
                : `${config.modelName}.store`;

            if (typeof route === "function") {
                targetUrl = route(defaultRouteName, submitParams ?? (isEditMode ? recordId : undefined));
            } else {
                targetUrl = isEditMode ? `/${config.modelName}/${recordId}` : `/${config.modelName}`;
            }
        }

        const method = submitMethod ?? config.submitMethod ?? (isEditMode ? "put" : "post");

        const options = {
            onSuccess: (page: any) => {
                onSuccess?.(page);
            },
            onError: (errs: any) => {
                onError?.(errs);
            },
        };

        if (method === "put") {
            put(targetUrl, options);
        } else if (method === "patch") {
            patch(targetUrl, options);
        } else {
            post(targetUrl, options);
        }
    };

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

    const defaultCancelUrl = typeof route === "function" && route().has(`${config.modelName}.index`)
        ? route(`${config.modelName}.index`)
        : "/dashboard";

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={String(pageTitle)} />
            <form onSubmit={handleSubmit} className={`flex flex-col justify-between h-full ${className ?? ""}`}>
                <div className="shrink-0 border-b p-3 flex items-center justify-between bg-accent/30">
                    <h2 className="font-medium">{headerTitle}</h2>
                </div>

                <div className="h-full flex-1 overflow-y-auto">
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
                                    <div
                                        key={`${section.key}-${field.key}-${index}`}
                                        className={`p-3 ${gridRow[field.rowSpan ?? 1]} ${gridColSpan[field.colSpan ?? 1]}`}
                                    >
                                        <FieldRenderer
                                            field={field}
                                            value={data[field.key]}
                                            onChange={(val) => setData(field.key, val)}
                                            error={errors[field.key]}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="shrink-0 p-3 border-t flex gap-3 bg-accent/30">
                    <Button type="submit" disabled={processing}>
                        {processing && <Loader2 className="mr-2 size-4 animate-spin" />}
                        {isEditMode ? (config.editLabel || "Save Changes") : (config.createLabel || "Create")}
                    </Button>

                    <Button type="button" variant="outline" asChild>
                        <Link href={cancelHref ?? defaultCancelUrl}>
                            Cancel
                        </Link>
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}
