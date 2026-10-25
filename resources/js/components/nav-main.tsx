import { SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();

    const [openSubNav, setOpenSubNav] = useState<string | null>(null);

    const handleOpenSubNav = (itemTitle: string) => {
        setOpenSubNav(openSubNav === itemTitle ? null : itemTitle);
    };

    return (
        <SidebarGroup className="px-0 py-0">
            {/* <SidebarGroupLabel className="px-2 text-[11px] font-semibold tracking-wider text-sidebar-foreground/60">
                القائمة الرئيسية
            </SidebarGroupLabel> */}
            <SidebarMenu className="gap-1">
                {items.map((item) => {
                    const isActive = page.url === item.url || (item.url !== '/dashboard' && page.url.startsWith(item.url ?? '#'));
                    const HasActive = (item.children?.some((child) => child.url === page.url) ?? false);
                    useEffect(() => {
                        if (HasActive) {
                            setOpenSubNav(item.title);
                        }
                    }, [HasActive]);
                    return (
                        <SidebarMenuItem key={item.title} className={(item.children ? 'relative flex flex-col' : '')}>
                            <SidebarMenuButton
                                asChild
                                isActive={isActive}
                                tooltip={item.title}
                                className="group/item relative"
                            >
                                {!item.children ? (

                                    <Link href={item.url ?? '#'} prefetch className="flex items-center gap-3">
                                        {item.icon && (
                                            <item.icon className={`size-4.5 transition-transform duration-150 ${isActive ? 'text-primary' : 'text-sidebar-foreground/70 group-hover/item:text-sidebar-foreground'}`} />
                                        )}
                                        <span className="truncate">{item.title}</span>
                                    </Link>
                                ) : (
                                    <div className={`${(openSubNav === item.title) ? 'bg-sidebar-accent/40' : ''} w-full flex items-center justify-between gap-3`} onClick={() => handleOpenSubNav(item.title)}>
                                        <div className="flex items-center gap-3">
                                            {item.icon && (
                                                <item.icon className={`size-4.5 transition-transform duration-150 ${isActive ? 'text-primary' : 'text-sidebar-foreground/70 group-hover/item:text-sidebar-foreground'}`} />
                                            )}
                                            <span className="truncate">{item.title}</span>
                                        </div>

                                        {item.children && <ChevronRight className={`size-4 transition-transform ${(openSubNav === item.title) ? 'rotate-270' : 'rotate-90'}`} />}
                                    </div>
                                )}
                            </SidebarMenuButton>
                            {(openSubNav === item.title) && item.children && (
                                <SidebarMenu className='mt-2 relative before:absolute before:w-px before:h-full before:bg-sidebar-border/80 before:top-0 before:start-4'>
                                    {item.children.map((child) => (
                                        <SidebarMenuItem key={child.title}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={page.url === child.url}
                                                tooltip={child.title}
                                                variant={'sub'}
                                                size={'sm'}
                                            >
                                                <Link href={child.url ?? '#'} prefetch>
                                                    {child.icon && (
                                                        <child.icon className="size-4.5 transition-transform duration-150" />
                                                    )}
                                                    <span className="truncate">{child.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            )}
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
