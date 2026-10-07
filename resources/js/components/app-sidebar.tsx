import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { LayoutDashboard, ListTodo } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Module',
        url: '/module',
        icon: ListTodo,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset" side="left" className="border-s border-sidebar-border/60">
            <SidebarHeader className="border-b border-sidebar-border/40 px-0 py-2.5">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="rounded-xl transition-all hover:bg-sidebar-accent/50">
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="py-2">
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border/40 p-2.5">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
