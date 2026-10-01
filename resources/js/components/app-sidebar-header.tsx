import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Search } from 'lucide-react';
import { Input } from './ui/input';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    return (
        <header className="border-sidebar-border/60 flex h-14 shrink-0 items-center justify-between gap-4 border-b bg-background/85 px-4 backdrop-blur-md transition-[width,height] ease-linear">
            <div className="flex items-center gap-2.5">
                <SidebarTrigger className="-ms-1" />
                <div className="hidden h-4 w-px bg-sidebar-border/80 sm:block" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <div className="flex items-center gap-2">
                <div className="relative hidden items-center gap-2 rounded-lg border border-sidebar-border/70 bg-sidebar/50 text-xs text-muted-foreground transition-colors hover:border-sidebar-border hover:bg-sidebar md:flex w-67">
                    <Search className="size-4 absolute start-2.5 opacity-85" />
                    <Input placeholder='Search...' className='ps-9 h-9 font-light' />
                    <kbd className="absolute end-2 pointer-events-none inline-flex h-4.5 select-none items-center gap-0.5 rounded border border-sidebar-border bg-background px-1.5 font-mono text-[13.5px] font-medium text-muted-foreground">
                        <span className="text-[8.5px] me-1">⌘</span>K
                    </kbd>
                </div>
                <AppearanceToggleDropdown />
            </div>
        </header>
    );
}
