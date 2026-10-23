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
        ],
    },
];