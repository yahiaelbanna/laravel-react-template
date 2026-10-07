import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';

export function UserInfo({ user, showEmail = false }: { user: User; showEmail?: boolean }) {
    const getInitials = useInitials();

    return (
        <>
            <div className="relative shrink-0">
                <Avatar className="h-8.5 w-8.5 overflow-hidden rounded-xl ring-1 ring-sidebar-border">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-semibold text-xs">
                        {getInitials(user.name)}
                    </AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-0.5 -end-0.5 size-2 rounded-full border-2 border-sidebar bg-emerald-500" />
            </div>
            <div className="grid flex-1 text-start text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold text-foreground text-[13px]">{user.name}</span>
                {/* {showEmail ? (
                    <span className="text-muted-foreground truncate text-[11px]">{user.email}</span>
                ) : (
                    <span className="text-muted-foreground/80 truncate text-[11px]">متصل</span>
                )} */}
            </div>
        </>
    );
}
