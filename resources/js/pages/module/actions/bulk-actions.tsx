import { useDialog } from "@/components/providers/dialog-provider"
import useSelection from "@/hooks/resource-page/use-selection";
import { toast } from "sonner";

export function useActions() {
    const dialog = useDialog();
    const { selected, clear } = useSelection();
    return {
        "mass-delete": async () => {
            const confirmed = await dialog.confirm({
                title: "Delete",
                description: `Are you sure you want to delete ${selected.size} items?`,
                confirmText: "Delete",
                cancelText: "Cancel",
                variant: "destructive",
            });

            if (confirmed) {
                // console.log('Deleted');
                toast.success("Items deleted successfully");
                clear();
            }
        }
    }
}