import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex aspect-square size-8.5 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs ring-1 ring-primary/20">
                <AppLogoIcon className="size-4.5" />
            </div>
            <div className="grid flex-1 text-start leading-tight group-data-[collapsible=icon]:hidden">
                <div className="flex items-center gap-1.5">
                    {/* <span className="truncate font-bold tracking-tight text-foreground text-[15px]">ريزونا</span> */}
                    <span className="truncate font-bold tracking-tight text-foreground text-[15px]">Rizuna</span>
                    {/* <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">Rizuna</span> */}
                </div>
                {/* <span className="truncate text-xs text-muted-foreground font-normal">إدارة المحتوى والمهام</span> */}
            </div>
        </div>
    );
}
