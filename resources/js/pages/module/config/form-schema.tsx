import { ResourceForm } from "@/types/form-config-type";

export const formSchema: ResourceForm = [
    {
        key: "basic-information",
        // title: "Basic Information",
        // description: "Basic information of the module",
        columns: 2,
        fields: [
            {
                key: "name",
                label: "Name",
                placeholder: "Name of the module",
                defaultValue: "",
                required: true,
                disabled: false,
                readonly: false,
                hidden: false,
                className: "",
                type: "text",
            },
            {
                key: "description",
                label: "Description",
                placeholder: "Description of the module",
                defaultValue: "",
                required: false,
                disabled: false,
                readonly: false,
                hidden: false,
                className: "",
                type: "textArea",
                // rowSpan: 3,
            },
            {
                key: "type",
                label: "Type",
                placeholder: "Type of the module",
                type: "select",
                options: [
                    { label: "Web Module", value: "web-module" },
                    { label: "Mobile Module", value: "mobile-module" },
                    { label: "API Module", value: "api-module" },
                ]
            },
            {
                key: "roles",
                label: "Roles",
                placeholder: "Roles of the module",
                type: "multi-select",
                options: [
                    { label: "Super Admin", value: "super-admin" },
                    { label: "Admin", value: "admin" },
                    { label: "Editor", value: "editor" },
                    { label: "Viewer", value: "viewer" },
                ]
            },
            {
                key: "apiSelect",
                label: "API Select",
                placeholder: "API Select",
                type: "apiSelect",
                options: {
                    endpoint: "/api/data",
                },
                getOptionLabel: (item: any) => {
                    return (
                        <div className="flex items-center">
                            <div className="flex size-6 rounded-md items-center justify-center bg-primary text-primary-foreground mr-3">
                                {item.name[0]}
                            </div>
                            <div className="flex flex-col">
                                <div className="font-medium">{item.name}</div>
                                <div className="text-[10px] text-muted-foreground">{item.description}</div>
                            </div>
                        </div>
                    )
                },
                getOptionValue: (item: any) => item.id,
            },
            {
                key: "apiSelect2",
                label: "API Select 2",
                placeholder: "API Select 2",
                type: "apiSelect",
                options: {
                    endpoint: "/api/data",
                },
                getOptionLabel: (item: any) => item.name,
                getOptionValue: (item: any) => item.id,
            }
        ],
    },
];