import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { Head } from "@inertiajs/react";
import { Download, Filter, Kanban, MoreVertical, Plus, Table2, Upload } from "lucide-react";

export default function TasksIndex() {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'الرئيسية',
            href: '/dashboard',
        },
        {
            title: 'المهام',
            href: '/tasks',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="المهام" />

            {/* START THE TEMPLATE PAGE */}

            <div className="border-y py-2 px-4 items-center justify-between flex">
                <div className="flex items-center gap-2">
                    <Button variant={'ghost'} size={'sm'}>
                        <Filter className="size-3" />
                        ترشيح
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
                    <Button variant={"outline"} size={'sm'}><Upload className="opacity-60" />استراد</Button>
                    <Button variant={"outline"} size={'sm'}><Download className="opacity-60" />تصدير</Button>
                    <Button size={'sm'}><Plus />إضافة مهمة</Button>
                </div>
            </div>


            <div>
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-muted-foreground/5!">
                            <TableHead><Checkbox /></TableHead>
                            <TableHead>#</TableHead>
                            <TableHead>الاسم</TableHead>
                            <TableHead>المسؤول</TableHead>
                            <TableHead>العميل</TableHead>
                            <TableHead>الحالة</TableHead>
                            <TableHead>الأولوية</TableHead>
                            <TableHead>تاريخ البدء</TableHead>
                            <TableHead>تاريخ الانتهاء</TableHead>
                            <TableHead>المرفقات</TableHead>
                            <TableHead>الملاحظات</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell><Checkbox /></TableCell>
                            <TableCell>1</TableCell>
                            <TableCell>المهمة الأولى</TableCell>
                            <TableCell>المسؤول الأول</TableCell>
                            <TableCell>العميل الأول</TableCell>
                            <TableCell>الحالة الأولى</TableCell>
                            <TableCell>الأولوية الأولى</TableCell>
                            <TableCell>تاريخ البدء الأول</TableCell>
                            <TableCell>تاريخ الانتهاء الأول</TableCell>
                            <TableCell>المرفقات الأولى</TableCell>
                            <TableCell>الملاحظات الأولى</TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="p-0 size-7"><MoreVertical /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start">
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem>تعديل</DropdownMenuItem>
                                            <DropdownMenuItem>عرض</DropdownMenuItem>
                                        </DropdownMenuGroup>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem className="text-destructive hover:bg-red-500/10" >حذف</DropdownMenuItem>
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Checkbox /></TableCell>
                            <TableCell>1</TableCell>
                            <TableCell>المهمة الأولى</TableCell>
                            <TableCell>المسؤول الأول</TableCell>
                            <TableCell>العميل الأول</TableCell>
                            <TableCell>الحالة الأولى</TableCell>
                            <TableCell>الأولوية الأولى</TableCell>
                            <TableCell>تاريخ البدء الأول</TableCell>
                            <TableCell>تاريخ الانتهاء الأول</TableCell>
                            <TableCell>المرفقات الأولى</TableCell>
                            <TableCell>الملاحظات الأولى</TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="p-0 size-7"><MoreVertical /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start">
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem>تعديل</DropdownMenuItem>
                                            <DropdownMenuItem>عرض</DropdownMenuItem>
                                        </DropdownMenuGroup>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem className="text-destructive hover:bg-red-500/10" >حذف</DropdownMenuItem>
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Checkbox /></TableCell>
                            <TableCell>1</TableCell>
                            <TableCell>المهمة الأولى</TableCell>
                            <TableCell>المسؤول الأول</TableCell>
                            <TableCell>العميل الأول</TableCell>
                            <TableCell>الحالة الأولى</TableCell>
                            <TableCell>الأولوية الأولى</TableCell>
                            <TableCell>تاريخ البدء الأول</TableCell>
                            <TableCell>تاريخ الانتهاء الأول</TableCell>
                            <TableCell>المرفقات الأولى</TableCell>
                            <TableCell>الملاحظات الأولى</TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="p-0 size-7"><MoreVertical /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start">
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem>تعديل</DropdownMenuItem>
                                            <DropdownMenuItem>عرض</DropdownMenuItem>
                                        </DropdownMenuGroup>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem className="text-destructive hover:bg-red-500/10 hover:text-destructive" >حذف</DropdownMenuItem>
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
            {/* END THE TEMPLATE PAGE */}
        </AppLayout>
    );
}