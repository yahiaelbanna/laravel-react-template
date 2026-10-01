import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, CalendarRange, Folder, KeyRound, LayoutDashboard, LayoutGrid, ListTodo, Sparkles, UserCog2, Users2 } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'الرئيسية',
        url: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'المهام',
        url: '/tasks',
        icon: ListTodo,
    },
    {
        title: 'المحتوى',
        url: '/content',
        icon: CalendarRange,
    },
    {
        title: 'العملاء',
        url: '/customers',
        icon: Users2,
    },
    {
        title: 'خطط الاشتراكات',
        url: '/plans',
        icon: Sparkles,
    },
    {
        title: 'المستخدمين',
        url: '/users',
        icon: UserCog2,
    },
    {
        title: 'الصلاحيات',
        url: '/permissions',
        icon: KeyRound,
    },
    // {
    //     title: 'المستخدمين',
    //     url: '/users',
    //     icon: LayoutGrid,
    // },
];

// const footerNavItems: NavItem[] = [
//     {
//         title: 'Repository',
//         url: 'https://github.com/laravel/react-starter-kit',
//         icon: Folder,
//     },
//     {
//         title: 'Documentation',
//         url: 'https://laravel.com/docs/starter-kits',
//         icon: BookOpen,
//     },
// ];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset" side="right" className="border-s border-sidebar-border/60">
            <SidebarHeader className="border-b border-sidebar-border/40 px-3 py-2.5">
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
