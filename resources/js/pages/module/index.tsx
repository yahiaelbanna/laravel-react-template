import ResourcePage from "@/components/resource-page/resource-page";
import config from "@/pages/module/config";



export default function TasksIndex() {
    const data = [
        {
            id: 1,
            name: "Task 1",
            email: "[EMAIL_ADDRESS]",
            phone: "1234567890",
            address: "123 Main St",
            balance: 4002,
            created_at: "2022-01-01",
            updated_at: "2022-01-01",
        },
        {
            id: 2,
            name: "Task 2",
            email: "[EMAIL_ADDRESS]",
            phone: "1234567890",
            address: "123 Main St",
            balance: 6534,
            created_at: "2022-01-01",
            updated_at: "2022-01-01",
        },
        {
            id: 3,
            name: "Task 3",
            email: "[EMAIL_ADDRESS]",
            phone: "1234567890",
            address: "123 Main St",
            balance: 10011,
            created_at: "2022-01-01",
            updated_at: "2022-01-01",
        },
    ];

    return (
        <ResourcePage config={config} data={data} />
    );
}