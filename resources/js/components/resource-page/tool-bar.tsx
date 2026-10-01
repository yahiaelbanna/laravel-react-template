import { Button } from "@/components/ui/button";
import { Upload, Download, Filter, Kanban, Table2, Plus } from "lucide-react";

export default function ToolBar() {
    return (

        <div className="border-y py-3 px-4 items-center justify-between flex">
            <div className="flex items-center gap-2">
                <Button variant={'ghost'} size={'sm'}>
                    <Filter className="size-3" />
                    Filter
                </Button>
                <div className="h-6 border-[1px]"></div>
                <div className="flex gap-1.5 items-center">
                    <Button variant={'secondaryBrand'} className="p-1.5" size={'sm'}>
                        <Table2 className="size-5! stroke-[1.5px]" />
                    </Button>
                    <Button variant={'ghost'} className="p-1.5 opacity-60" size={'sm'}>
                        <Kanban className="size-5! stroke-[1.5px]" />
                    </Button>
                </div>
            </div>
            <div className="flex gap-2 items-center">
                <Button variant={"outline"} size={'sm'}><Upload className="opacity-60" />Import</Button>
                <Button variant={"outline"} size={'sm'}><Download className="opacity-60" />Export</Button>
                <Button size={'sm'}><Plus />Add Module</Button>
            </div>
        </div>
    );
}