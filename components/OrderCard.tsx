import { CalendarDays, Receipt, ShoppingBag, UserRound } from "lucide-react"

import OrderModal from "./OrderModal"
import { Badge } from "./ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card"
import type { Order, OrderPayload } from "@/lib/dto/order"

interface OrderCardProps {
  order: Order
  t?: (key: string, options?: { defaultMessage?: string }) => string
  onEdit?: (id: string, data: Partial<OrderPayload>) => Promise<unknown>
  editLabel?: string
}

export default function OrderCard({
  order,
  t = (key: string, options?: { defaultMessage?: string }) =>
    options?.defaultMessage ?? key,
  onEdit,
  editLabel,
}: OrderCardProps) {
  const formatCurrency = (value: number | null | undefined) =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value ?? 0)

  const formattedDate = order.orderDate
    ? new Date(order.orderDate).toLocaleDateString()
    : t("card.noDate", { defaultMessage: "Date not set" })

  const itemCount = order.orderItems?.length ?? 0
  const customerLabel = order.customerId
    ? `${t("card.customer", { defaultMessage: "Customer" })} #${order.customerId}`
    : t("card.noCustomer", { defaultMessage: "No customer linked" })

  return (
    <Card className="flex aspect-square h-full flex-col justify-between border-muted/60 bg-card/70 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
      <CardHeader className="space-y-2 pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg">
            {t("card.id", { defaultMessage: "Order" })} #{order.id}
          </CardTitle>
          <Badge variant="secondary" className="text-xs font-semibold">
            {itemCount} {t("card.items", { defaultMessage: "items" })}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-2 text-sm text-muted-foreground">
          <UserRound className="h-4 w-4" aria-hidden />
          <span className="truncate">{customerLabel}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-4">
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" aria-hidden />
              <span>{t("card.date", { defaultMessage: "Order date" })}</span>
            </div>
            <span className="font-medium text-foreground">{formattedDate}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4" aria-hidden />
              <span>{t("card.total", { defaultMessage: "Total" })}</span>
            </div>
            <span className="font-semibold text-foreground">
              {formatCurrency(order.total)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" aria-hidden />
              <span>{t("card.summary", { defaultMessage: "Items" })}</span>
            </div>
            <span className="font-medium text-foreground">
              {itemCount > 0
                ? t("card.itemSummary", {
                    defaultMessage: "{count} item(s)"
                  })
                : t("card.emptyItems", { defaultMessage: "No items" })}
            </span>
          </div>
        </div>

        {onEdit && (
          <OrderModal
            order={order}
            onSubmit={(payload) => onEdit(order.id, payload)}
            triggerLabel={editLabel ?? t("actions.edit", { defaultMessage: "Edit" })}
            triggerButtonProps={{
              variant: "outline",
              size: "sm",
              className: "w-full",
            }}
          />
        )}
      </CardContent>
    </Card>
  )
}
