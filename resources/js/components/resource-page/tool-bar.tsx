import { Button } from "@/components/ui/button";
import Config, { ViewTypes } from "@/types/config-type";
import { Upload, Download, Filter, Kanban, Table2, Plus, LucideIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import useViewType from "@/hooks/use-view-type";

export default function ToolBar({ config }: { config: Config }) {
    const { viewType, changeView } = useViewType({ viewTypes: config.viewTypes });

    return (

        <div className="border-y py-3 px-4 items-center justify-between flex">
            <div className="flex items-center gap-2">
                <Button variant={'ghost'} size={'sm'}>
                    <Filter className="size-3" />
                    Filter
                </Button>
                <div className="h-6 border-[1px]"></div>
                <div className="flex gap-1.5 items-center">
                    {(config.viewTypes?.includes('table') || !config.viewTypes || config.viewTypes?.length === 0) && (
                        <ViewTypeButton viewType={viewType} changeView={changeView} type="table" icon={Table2} />
                    )}
                    {config.viewTypes?.includes('kanban') && (
                        <ViewTypeButton viewType={viewType} changeView={changeView} type="kanban" icon={Kanban} />
                    )}
                </div>
            </div>
            <div className="flex gap-2 items-center">
                {/* <Button variant={"outline"} size={'sm'}><Upload className="opacity-60" />Import</Button>
                <Button variant={"outline"} size={'sm'}><Download className="opacity-60" />Export</Button> */}
                <Button size={'sm'}><Plus />{config.createLabel ?? ('Add ' + config.title)}</Button>
            </div>
        </div>
    );
}

function ViewTypeButton({ viewType, changeView, type, icon }: { viewType: ViewTypes, changeView: (view: ViewTypes) => void, type: ViewTypes, icon: LucideIcon }) {
    const Icon = icon;
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button variant={viewType === type ? 'secondaryBrand' : 'ghost'} className={`p-1.5 ${viewType === type ? '' : 'opacity-60'}`} size={'sm'} onClick={() => changeView(type)}>
                    <Icon className="size-5! stroke-[2px]" />
                </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
                <p className="text-xs">{type} View</p>
            </TooltipContent>
        </Tooltip>
    );
}