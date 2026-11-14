import * as React from "react";
import { BreadcrumbItem } from "@/types";
import Config from "@/types/config-type";
import { FieldConfig } from "@/types/form-config-type";
import { useForm } from "@inertiajs/react";
import FieldRenderer, { FieldRendererProps } from "../renderer/field-renderer";

export interface UseResourceFormOptions {
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
}

export interface UseResourceFormReturn {
    data: Record<string, any>;
    setData: (keyOrUpdater: any, value?: any) => void;
    processing: boolean;
    errors: Record<string, string>;
    isEditMode: boolean;
    pageTitle: string;
    headerTitle: string;
    breadcrumbs: BreadcrumbItem[];
    defaultCancelUrl: string;
    fieldsMap: Record<string, FieldConfig>;
    getField: (key: string) => FieldConfig | undefined;
    renderField: (key: string, overrides?: Partial<FieldRendererProps>) => React.ReactNode;
    handleSubmit: (e: React.FormEvent) => void;
}

export function useResourceForm({
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
}: UseResourceFormOptions): UseResourceFormReturn {
    const isEditMode = isEdit !== undefined
        ? isEdit
        : Boolean(initialData && (initialData.id !== undefined || Object.keys(initialData).length > 0));

    const pageTitle = String(
        isEditMode
            ? (config.editLabel || `Edit ${config.title}`)
            : (config.createLabel || `Create ${config.title}`)
    );

    const headerTitle = String(
        isEditMode
            ? (config.editLabel || `Edit ${config.title}`)
            : (config.createLabel || `Add New ${config.title}`)
    );

    const fieldsMap = React.useMemo(() => {
        const map: Record<string, FieldConfig> = {};
        config.form?.forEach((section) => {
            section.fields?.forEach((field) => {
                map[field.key] = field;
            });
        });
        return map;
    }, [config.form]);

    const getField = React.useCallback(
        (key: string) => fieldsMap[key],
        [fieldsMap]
    );

    const computeInitialData = React.useCallback(() => {
        const values: Record<string, any> = {};

        config.form?.forEach((section) => {
            section.fields?.forEach((field) => {
                const isMulti = field.type === "multi-select" || (field.type === "apiSelect" && (field as any).multiple);
                const isRepeater = field.type === "repeater";
                const fallback = isRepeater ? [] : (isMulti ? [] : "");
                let initialVal = initialData?.[field.key] ?? field.defaultValue ?? fallback;

                if (isRepeater && typeof initialVal === "string") {
                    try {
                        const parsed = JSON.parse(initialVal);
                        if (Array.isArray(parsed)) initialVal = parsed;
                    } catch { }
                }

                values[field.key] = initialVal;
            });
        });

        if (initialData) {
            Object.keys(initialData).forEach((key) => {
                if (values[key] === undefined) {
                    values[key] = initialData[key];
                }
            });
        }

        return values;
    }, [config.form, initialData]);

    const { data, setData, post, put, patch, processing, errors } = useForm<Record<string, any>>(computeInitialData());

    const initialDataRef = React.useRef(initialData);
    React.useEffect(() => {
        if (initialData && initialData !== initialDataRef.current) {
            initialDataRef.current = initialData;
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
            title: pageTitle,
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

    const defaultCancelUrl = cancelHref
        ?? (typeof route === "function" && route().has(`${config.modelName}.index`)
            ? route(`${config.modelName}.index`)
            : "/dashboard");

    const renderField = React.useCallback(
        (key: string, overrides?: Partial<FieldRendererProps>) => {
            const field = fieldsMap[key];
            if (!field) return null;

            return (
                <FieldRenderer
                    field={overrides?.field ?? field}
                    value={data[key]}
                    onChange={(val) => setData(key, val)}
                    error={errors[key]}
                    {...overrides}
                />
            );
        },
        [fieldsMap, data, errors, setData]
    );

    return {
        data,
        setData,
        processing,
        errors: errors as Record<string, string>,
        isEditMode,
        pageTitle,
        headerTitle,
        breadcrumbs,
        defaultCancelUrl,
        fieldsMap,
        getField,
        renderField,
        handleSubmit,
    };
}