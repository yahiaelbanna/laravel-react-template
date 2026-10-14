export default function DetailsDrawer({ row }: { row: any }) {
    return (
        <div>
            <h1>Details Would be Here with any style, For Example</h1>
            <p>Item Name is: {row.name}</p>
            <p>Item Phone is: {row.phone}</p>
        </div>
    );
}