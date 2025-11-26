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
import { OrdersApiResponse } from "@/lib/api/orders"

interface OrderCardProps {
  order: OrdersApiResponse
  t?: (key: string, options?: { defaultMessage?: string }) => string
  onEdit?: (id: number, data: Partial<OrderPayload>) => Promise<unknown>
  editLabel?: string
  loadOrderById?: (id: number) => Promise<Order>
}

export default function OrderCard({
  order,
  t = (key: string, options?: { defaultMessage?: string }) =>
    options?.defaultMessage ?? key,
  onEdit,
  editLabel,
  loadOrderById,
}: OrderCardProps) {
  const formatCurrency = (value: number | null | undefined) =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value ?? 0)

  const formattedDate = order.order_date
    ? new Date(order.order_date).toLocaleDateString()
    : t("card.noDate", { defaultMessage: "Date not set" })

  const itemCount = order.order_items_count ?? 0
  const customerLabel = order.customer_id
    ? `${t("card.customer", { defaultMessage: "Customer" })} #${order.customer_name}`
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
                ? itemCount + (t("card.itemSummary", { defaultMessage: " items" }) ?? "")
                : t("card.emptyItems", { defaultMessage: "No items" })}
            </span>
          </div>
        </div>

        {onEdit && (
          <OrderModal
            order={order}
            loadOrderById={loadOrderById}
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
