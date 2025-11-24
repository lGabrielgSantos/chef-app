import { Avatar, AvatarFallback } from "./ui/avatar";
import type { CustomerStatus } from "@/lib/api/customers";

export default function NewCustomerCard({ customer, t = (key: string, options?: { defaultMessage?: string }) => options?.defaultMessage ?? key }: {
    customer: any;
    t?: (key: string, options?: { defaultMessage?: string }) => string;
}) {
    const formatStatus = (status?: CustomerStatus | null) => {
        const statusKey = status ?? "active";
        return t(`status.${statusKey}`, { defaultMessage: statusKey });
    };

    const getStatusStyles = (status?: CustomerStatus | null) => {
        const statusKey = status ?? "active";
        switch (statusKey) {
            case "active":
                return "bg-green-500 text-white";
            case "trial":
                return "bg-yellow-500 text-white";
            case "inactive":
                return "bg-gray-500 text-white";
            default:
                return "bg-secondary text-secondary-foreground";
        }
    };

    return (
        <div
            key={customer.id ?? customer.email}
            className="flex flex-col gap-3 rounded-lg border bg-card px-4 py-3 shadow-sm transition-colors hover:bg-muted/60 sm:flex-row sm:items-center sm:justify-between"
        >
            <div className="flex items-start gap-3 sm:items-center">
                <Avatar className="h-10 w-10">
                    <AvatarFallback>
                        {customer.name
                            .split(" ")
                            .map((part) => part[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div className="space-y-0.5">
                    <p className="font-medium leading-none">{customer.name}</p>
                    <p className="text-sm break-words text-muted-foreground">
                        {customer.email}
                    </p>
                    {customer.phone && (
                        <p className="text-sm break-words text-muted-foreground">
                            {customer.phone}
                        </p>
                    )}
                </div>
            </div>
            <div className="flex items-start gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-4">
                <span>{customer.city}</span>
                <span className={`self-start rounded-full px-3 py-1 text-xs font-semibold sm:self-auto ${getStatusStyles(customer.status)}`}>
                    {formatStatus(customer.status)}
                </span>
            </div>
        </div>
    )
}