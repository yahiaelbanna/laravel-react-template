import { Checkbox } from "@/components/ui/checkbox";
import { TableCell, TableRow } from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import DataTableCell from "./cell";
import Config from "@/types/config-type";



export default function DataTableRow({ config, item }: { config: Config, item: any }) {
    return (
        <TableRow>
            <TableCell><Checkbox className="size-4.5!" /></TableCell>
            {config.columns.map((column) => (
                <DataTableCell key={column.key} column={column} value={item[column.key]} />
            ))}
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
    );
}
// return (
//     <TableRow>
//         <TableCell><Checkbox className="size-4.5!" /></TableCell>
//         <DataTableCell />
//         <DataTableCell />
//         <DataTableCell />
//         <DataTableCell />
//         <DataTableCell />
//         <DataTableCell />
//         <DataTableCell />
//         <DataTableCell />
//         <TableCell>
//             <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                     <Button variant="ghost" className="p-0 size-7"><MoreVertical /></Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent align="start">
//                     <DropdownMenuGroup>
//                         <DropdownMenuItem>Edit</DropdownMenuItem>
//                         <DropdownMenuItem>View</DropdownMenuItem>
//                     </DropdownMenuGroup>
//                     <DropdownMenuSeparator />
//                     <DropdownMenuGroup>
//                         <DropdownMenuItem className="text-destructive hover:bg-red-500/10" >Delete</DropdownMenuItem>
//                     </DropdownMenuGroup>
//                 </DropdownMenuContent>
//             </DropdownMenu>
//         </TableCell>
//     </TableRow>
// );
// }