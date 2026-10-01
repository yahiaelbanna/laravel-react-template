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
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Module',
            href: '/module',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Module" />

            {/* START THE TEMPLATE PAGE */}

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


            <div>
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-muted-foreground/0!">
                            <TableHead><Checkbox className="size-4.5!" /></TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Manager</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead>End Date</TableHead>
                            <TableHead>Attachments</TableHead>
                            <TableHead>Notes</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell><Checkbox className="size-4.5!" /></TableCell>
                            <TableCell>Task1</TableCell>
                            <TableCell>User1</TableCell>
                            <TableCell>Client1</TableCell>
                            <TableCell>Status1</TableCell>
                            <TableCell>Priority1</TableCell>
                            <TableCell>2022-01-01</TableCell>
                            <TableCell>2022-01-01</TableCell>
                            <TableCell>Attachments1</TableCell>
                            <TableCell>Notes1</TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="p-0 size-7"><MoreVertical /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start">
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem>Edit</DropdownMenuItem>
                                            <DropdownMenuItem>View</DropdownMenuItem>
                                        </DropdownMenuGroup>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem className="text-destructive hover:bg-red-500/10" >Delete</DropdownMenuItem>
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Checkbox className="size-4.5!" /></TableCell>
                            <TableCell>Task2</TableCell>
                            <TableCell>User2</TableCell>
                            <TableCell>Client2</TableCell>
                            <TableCell>Status2</TableCell>
                            <TableCell>Priority2</TableCell>
                            <TableCell>2022-01-01</TableCell>
                            <TableCell>2022-01-01</TableCell>
                            <TableCell>Attachments2</TableCell>
                            <TableCell>Notes2</TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="p-0 size-7"><MoreVertical /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start">
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem>Edit</DropdownMenuItem>
                                            <DropdownMenuItem>View</DropdownMenuItem>
                                        </DropdownMenuGroup>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem className="text-destructive hover:bg-red-500/10" >Delete</DropdownMenuItem>
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Checkbox className="size-4.5!" /></TableCell>
                            <TableCell>Task3</TableCell>
                            <TableCell>User3</TableCell>
                            <TableCell>Client3</TableCell>
                            <TableCell>Status3</TableCell>
                            <TableCell>Priority3</TableCell>
                            <TableCell>2022-01-01</TableCell>
                            <TableCell>2022-01-01</TableCell>
                            <TableCell>Attachments3</TableCell>
                            <TableCell>Notes3</TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="p-0 size-7"><MoreVertical /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start">
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem>Edit</DropdownMenuItem>
                                            <DropdownMenuItem>View</DropdownMenuItem>
                                        </DropdownMenuGroup>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem className="text-destructive hover:bg-red-500/10 hover:text-destructive" >Delete</DropdownMenuItem>
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