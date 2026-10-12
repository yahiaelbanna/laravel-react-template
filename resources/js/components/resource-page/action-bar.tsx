import { cn } from "@/lib/utils";
import Config from "@/types/config-type";
import { Button } from "../ui/button";

export default function ActionBar({ config, actions: customActions, className }: { config: Config, actions: any, className?: string }) {
    const actions = config.bulkActions;
    if (!actions) {
        return null;
    }
    return (

        <div className={cn("h-15 flex items-center px-4 py-3 gap-3 ", className)}>
            {actions?.map((action) => {

                const Icon = action.icon;
                const variant = action.variant ?? "outline";
                return (
                    <Button variant={variant} size={"sm"} className={variant === "outline" ? "" : "h-8 gap-1.5"} key={action.key} onClick={() => customActions[action.key]()}>
                        {Icon && <Icon className="opacity-70" />}
                        {action.label}
                    </Button>
                )
            }
            )}
        </div>
    );
}