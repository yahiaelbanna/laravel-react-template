import { Badge } from "@/components/ui/badge";
import { TableCell } from "@/components/ui/table";
import { formatNumberWithCommas } from "@/lib/format-utills";
import { BadgeVariant, Column } from "@/types/config-type";

export default function DataTableCell({ column, value }: { column: Column, value: any }) {
    return (
        <TableCell>
            {(() => {
                switch (column.type) {
                    case "text":
                        return <TextCell value={value} />;
                    case "email":
                        return <EmailCell value={value} />;
                    case "currency":
                        return <CurrencyCell value={value} />;
                    case "number":
                        return <NumberCell value={value} />;
                    case "date":
                        return <DateCell value={value} />;
                    case "badge":
                        const badgeVariant = column.options?.[value] ?? "default";
                        return <BadgeCell value={value} variant={badgeVariant} />;
                    default:
                        return value;
                }
            })()}
        </TableCell>
    );
}


function BadgeCell({ value, variant }: { value: any, variant: BadgeVariant }) {
    return <Badge variant={variant}>{value}</Badge>
}

function CurrencyCell({ value }: { value: any }) {
    return value == null || value === '' ? (
        <span className="text-muted-foreground ml-1 text-[10px] text-center">
            —
        </span>
    ) : (
        <div>
            {formatNumberWithCommas(value, true)}
            <span className="text-muted-foreground ml-1 text-[10px]">
                EGP
            </span>
        </div>
    )
}

function NumberCell({ value }: { value: any }) {
    return value == null || value === '' ? (
        <span className="text-muted-foreground ml-1 text-[10px] text-center">
            —
        </span>
    ) : (
        <div>
            {formatNumberWithCommas(value, true)}
        </div>
    )
}

function TextCell({ value }: { value: any }) {
    return <div className="capitalize">{value}</div>;
}
function DateCell({ value }: { value: any }) {
    return <div className="capitalize">{new Date(value).toLocaleDateString()}</div>;
}
function EmailCell({ value }: { value: any }) {
    return <div>{value}</div>;
}