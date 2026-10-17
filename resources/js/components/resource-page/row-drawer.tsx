import useDrawerSync from "@/hooks/resource-page/use-drawer-sync"
import Config from "@/types/config-type"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../ui/sheet";
import { cn } from "@/lib/utils";

export default function RowDrawer({ config }: { config: Config }) {
    const { selectedRow, close } = useDrawerSync();

    const titleText = typeof config.rowDrawer?.title === 'function' ? config.rowDrawer.title(selectedRow) : config.rowDrawer?.title;

    const descriptionText = typeof config.rowDrawer?.description === 'function' ? config.rowDrawer.description(selectedRow) : config.rowDrawer?.description;

    const Component = config.rowDrawer?.component as React.ComponentType<any>;
    // if (!selectedRow) return null;

    return (
        <Sheet open={!!selectedRow} onOpenChange={(open) => !open && close()}>
            <SheetContent className={cn(
                "h-full p-0 overflow-hidden shadow-2xl border-l border-border/60",
                (config.rowDrawer?.width || "sm:max-w-3xl")
            )}>

                <div className="p-3 px-4 border-b border-border/50 bg-muted/20">
                    <SheetHeader>
                        <SheetTitle className="text-base">{titleText}</SheetTitle>
                        <SheetDescription>
                            {descriptionText}
                        </SheetDescription>
                    </SheetHeader>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {Component && <Component row={selectedRow} />}
                </div>
            </SheetContent>
        </Sheet>
    )
}