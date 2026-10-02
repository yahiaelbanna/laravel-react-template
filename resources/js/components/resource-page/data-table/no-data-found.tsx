import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import Config from "@/types/config-type";
import { Database, Plus } from "lucide-react";

export default function NoDataFound({ config }: { config: Config }) {
    return (
        <TableRow className="w-full h-full">
            <TableCell colSpan={config.columns.length + 2} className="h-full text-center">
                <div className="flex flex-col items-center justify-center">
                    <div className="rounded-full bg-muted-foreground/10 flex items-center justify-center p-4 mb-5">
                        <Database className="size-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-base font-semibold text-muted-foreground mb-1">No {config.pluralTitle} found !</h3>
                    <p className="text-sm text-muted-foreground">Either no {config.pluralTitle} have been created yet, or your search/filters didn't match any {config.pluralTitle}.</p>
                    {config.createable && (
                        <Button variant="default" className="mt-5">
                            <Plus className="h-4 w-4" />
                            Create New {config.title}
                        </Button>
                    )}
                </div>
            </TableCell>
        </TableRow>
    );
}