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
                key: "release_date",
                label: "Release Date",
                placeholder: "DD/MM/YYYY",
                type: "date",
                tooltip: "You can type digits directly (e.g. 15052026) or pick from the calendar",
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
            },
            {
                key: "apiSelect1",
                label: "API Select",
                placeholder: "API Select",
                type: "apiSelect",
                options: {
                    endpoint: "/api/data",
                },
                getOptionLabel: (item: any) => {
                    return (
                        <div className="flex items-center">
                            <div className="flex size-5 rounded-lg items-center justify-center bg-primary text-primary-foreground mr-2">
                                {item.name[0]}
                            </div>
                            <div className="flex flex-col">
                                <div className="font-medium">{item.name}</div>
                                {/* <div className="text-[10px] text-muted-foreground">{item.description}</div> */}
                            </div>
                        </div>
                    )
                },
                getOptionValue: (item: any) => item.id,
                multiple: true,
            },
            {
                key: "apiSelect21",
                label: "API Select 2",
                placeholder: "API Select 2",
                type: "apiSelect",
                options: {
                    endpoint: "/api/data",
                },
                getOptionLabel: (item: any) => item.name,
                getOptionValue: (item: any) => item.id,
                multiple: true,
            },
            {
                key: "inputgroup",
                label: "Input Group",
                type: "inputGroup",
                addon: ("Egp"),
                addonAlign: "start"
            },
            {
                key: "features",
                label: "Module Features (Table Repeater)",
                type: "repeater",
                layout: "table",
                colSpan: 2,
                tooltip: "Add dynamic features for this module",
                addButtonText: "Add Feature",
                emptyText: "No features added yet. Click 'Add Feature' to start.",
                fields: [
                    {
                        key: "feature_name",
                        label: "Feature Name",
                        placeholder: "e.g. Dark Mode",
                        type: "text",
                        required: true,
                    },
                    {
                        key: "status",
                        label: "Status",
                        type: "select",
                        options: [
                            { label: "Active", value: "active" },
                            { label: "Beta", value: "beta" },
                            { label: "Deprecated", value: "deprecated" },
                        ],
                        defaultValue: "active",
                    },
                    {
                        key: "release_date",
                        label: "Release Date",
                        type: "date",
                        placeholder: "DD/MM/YYYY",
                    },
                ],
            },
            {
                key: "team_members",
                label: "Team Members (Card Repeater)",
                type: "repeater",
                layout: "card",
                colSpan: 2,
                columns: 2,
                itemTitle: "Member",
                addButtonText: "Add Member",
                emptyText: "No team members assigned.",
                fields: [
                    {
                        key: "name",
                        label: "Member Name",
                        placeholder: "e.g. John Doe",
                        type: "text",
                        required: true,
                    },
                    {
                        key: "email",
                        label: "Email",
                        placeholder: "john@example.com",
                        type: "email",
                    },
                    {
                        key: "role",
                        label: "Role",
                        type: "select",
                        options: [
                            { label: "Developer", value: "developer" },
                            { label: "Designer", value: "designer" },
                            { label: "Manager", value: "manager" },
                        ],
                        defaultValue: "developer",
                    },
                ],
            },
        ],
    },
];
