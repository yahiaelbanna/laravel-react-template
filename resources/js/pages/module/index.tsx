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
            status: "draft"
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
            status: "published"
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
            status: "published"
        },
        {
            id: 4,
            name: "Task 4",
            email: "[EMAIL_ADDRESS]",
            phone: "1234567890",
            address: "123 Main St",
            balance: 4002,
            created_at: "2022-01-01",
            updated_at: "2022-01-01",
            status: "draft"
        },
        {
            id: 5,
            name: "Task 5",
            email: "[EMAIL_ADDRESS]",
            phone: "1234567890",
            address: "123 Main St",
            balance: 6534,
            created_at: "2022-01-01",
            updated_at: "2022-01-01",
            status: "draft"
        },
        {
            id: 6,
            name: "Task 6",
            email: "[EMAIL_ADDRESS]",
            phone: "1234567890",
            address: "123 Main St",
            balance: 10011,
            created_at: "2022-01-01",
            updated_at: "2022-01-01",
            status: "draft"
        },
        {
            id: 7,
            name: "Task 7",
            email: "[EMAIL_ADDRESS]",
            phone: "1234567890",
            address: "123 Main St",
            balance: 4002,
            created_at: "2022-01-01",
            updated_at: "2022-01-01",
            status: "draft"
        },
        {
            id: 8,
            name: "Task 8",
            email: "[EMAIL_ADDRESS]",
            phone: "1234567890",
            address: "123 Main St",
            balance: 6534,
            created_at: "2022-01-01",
            updated_at: "2022-01-01",
            status: "draft"
        },
        {
            id: 9,
            name: "Task 9",
            email: "[EMAIL_ADDRESS]",
            phone: "1234567890",
            address: "123 Main St",
            balance: 10011,
            created_at: "2022-01-01",
            updated_at: "2022-01-01",
            status: "draft"
        },
        {
            id: 10,
            name: "Task 10",
            email: "[EMAIL_ADDRESS]",
            phone: "1234567890",
            address: "123 Main St",
            balance: 4002,
            created_at: "2022-01-01",
            updated_at: "2022-01-01",
            status: "draft"
        },
        {
            id: 11,
            name: "Task 11",
            email: "[EMAIL_ADDRESS]",
            phone: "1234567890",
            address: "123 Main St",
            balance: 6534,
            created_at: "2022-01-01",
            updated_at: "2022-01-01",
            status: "draft"
        },
        {
            id: 12,
            name: "Task 12",
            email: "[EMAIL_ADDRESS]",
            phone: "1234567890",
            address: "123 Main St",
            balance: 10011,
            created_at: "2022-01-01",
            updated_at: "2022-01-01",
            status: "draft"
        },
        {
            id: 13,
            name: "Task 13",
            email: "[EMAIL_ADDRESS]",
            phone: "1234567890",
            address: "123 Main St",
            balance: 4002,
            created_at: "2022-01-01",
            updated_at: "2022-01-01",
            status: "draft"
        },
        {
            id: 14,
            name: "Task 14",
            email: "[EMAIL_ADDRESS]",
            phone: "1234567890",
            address: "123 Main St",
            balance: 6534,
            created_at: "2022-01-01",
            updated_at: "2022-01-01",
            status: "draft"
        },
        {
            id: 15,
            name: "Task 15",
            email: "[EMAIL_ADDRESS]",
            phone: "1234567890",
            address: "123 Main St",
            balance: 10011,
            created_at: "2022-01-01",
            updated_at: "2022-01-01",
            status: "draft"
        },
        {
            id: 16,
            name: "Task 16",
            email: "[EMAIL_ADDRESS]",
            phone: "1234567890",
            address: "123 Main St",
            balance: 4002,
            created_at: "2022-01-01",
            updated_at: "2022-01-01",
            status: "draft"
        },
        {
            id: 17,
            name: "Task 17",
            email: "[EMAIL_ADDRESS]",
            phone: "1234567890",
            address: "123 Main St",
            balance: 6534,
            created_at: "2022-01-01",
            updated_at: "2022-01-01",
            status: "draft"
        },
        {
            id: 18,
            name: "Task 18",
            email: "[EMAIL_ADDRESS]",
            phone: "1234567890",
            address: "123 Main St",
            balance: 10011,
            created_at: "2022-01-01",
            updated_at: "2022-01-01",
            status: "draft"
        },
        {
            id: 19,
            name: "Task 19",
            email: "[EMAIL_ADDRESS]",
            phone: "1234567890",
            address: "123 Main St",
            balance: 4002,
            created_at: "2022-01-01",
            updated_at: "2022-01-01",
            status: "draft"
        },
        {
            id: 20,
            name: "Task 20",
            email: "[EMAIL_ADDRESS]",
            phone: "1234567890",
            address: "123 Main St",
            balance: 6534,
            created_at: "2022-01-01",
            updated_at: "2022-01-01",
            status: "draft"
        },
        {
            id: 21,
            name: "Task 21",
            email: "[EMAIL_ADDRESS]",
            phone: "1234567890",
            address: "123 Main St",
            balance: 10011,
            created_at: "2022-01-01",
            updated_at: "2022-01-01",
            status: "draft"
        },
        {
            id: 22,
            name: "Task 22",
            email: "[EMAIL_ADDRESS]",
            phone: "1234567890",
            address: "123 Main St",
            balance: 4002,
            created_at: "2022-01-01",
            updated_at: "2022-01-01",
            status: "draft"
        },
        {
            id: 23,
            name: "Task 23",
            email: "[EMAIL_ADDRESS]",
            phone: "1234567890",
            address: "123 Main St",
            balance: 6534,
            created_at: "2022-01-01",
            updated_at: "2022-01-01",
            status: "draft"
        },
        {
            id: 24,
            name: "Task 24",
            email: "[EMAIL_ADDRESS]",
            phone: "1234567890",
            address: "123 Main St",
            balance: 10011,
            created_at: "2022-01-01",
            updated_at: "2022-01-01",
            status: "draft"
        },
    ];

    return (
        <ResourcePage config={config} data={data} />
    );
}