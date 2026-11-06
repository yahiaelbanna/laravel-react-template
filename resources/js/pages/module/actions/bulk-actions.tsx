import { useDialog } from "@/components/providers/dialog-provider"
import { useResource } from "@/hooks/resource-page/use-resource";
import useSelection from "@/hooks/resource-page/use-selection";
import { ResourceService } from "@/services/resource.service";
import { toast } from "sonner";
import config from "../config/config";

export function useActions() {
    const dialog = useDialog();
    const { selected, clear } = useSelection();
    const resource = useResource({ resource: config.modelName });
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
                resource.bulkDestroy(selected, {
                    onSuccess: (response: any) => {
                        if (response.props.flash.success) {
                            clear();
                            toast.success(response.props.flash.success);
                        } else {
                            toast.error("try again later")
                        }
                    }
                });
            }
        }
    }
}