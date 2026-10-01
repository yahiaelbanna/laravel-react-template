import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    return (
        <SidebarGroup className="px-2.5 py-2">
            {/* <SidebarGroupLabel className="px-2 text-[11px] font-semibold tracking-wider text-sidebar-foreground/60">
                القائمة الرئيسية
            </SidebarGroupLabel> */}
            <SidebarMenu className="gap-1">
                {items.map((item) => {
                    const isActive = page.url === item.url || (item.url !== '/dashboard' && page.url.startsWith(item.url));
                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={isActive}
                                tooltip={item.title}
                                className="group/item relative"
                            >
                                <Link href={item.url} prefetch className="flex items-center gap-3">
                                    {item.icon && (
                                        <item.icon className={`size-4.5 transition-transform duration-150 ${isActive ? 'text-primary' : 'text-sidebar-foreground/70 group-hover/item:text-sidebar-foreground'}`} />
                                    )}
                                    <span className="truncate">{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
