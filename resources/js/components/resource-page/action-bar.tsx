import { cn } from "@/lib/utils";
import Config from "@/types/config-type";
import { Button } from "../ui/button";
import { Edit, Trash } from "lucide-react";

export default function ActionBar({ config, className }: { config: Config, className?: string }) {
    return (

        <div className={cn("h-15 flex items-center px-4 py-3 gap-3 ", className)}>
            <Button variant={"destructive"} size={"sm"} className="h-8 gap-1.5">
                <Trash className="opacity-70" />
                Delete
            </Button>
            <Button variant={"outline"} size={"sm"}>
                <Edit />
                Edit
            </Button>
        </div>
    );
}