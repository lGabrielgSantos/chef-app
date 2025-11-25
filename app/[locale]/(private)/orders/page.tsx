"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"

import OrderCard from "@/components/OrderCard"
import OrderModal from "@/components/OrderModal"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Spinner } from "@/components/ui/spinner"
import { useOrders } from "@/lib/hooks/useOrders"

export default function OrdersPage() {
  const t = useTranslations("ordersPage")
  const formT = useTranslations("ordersForm")
  const { orders, loading, error, addOrder, editOrder } = useOrders()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredOrders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return orders

    return orders.filter((order) =>
      [
        order.id,
        order.customerId,
        order.orderDate,
        order.total?.toString(),
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(query)),
    )
  }, [orders, searchTerm])

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex h-[85vh] flex-col">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl">{t("title")}</CardTitle>
            <CardDescription>{t("description")}</CardDescription>
          </div>
          <OrderModal onSubmit={addOrder} triggerLabel={t("addOrder")} />
        </CardHeader>

        <CardContent className="flex min-h-0 flex-1 flex-col gap-4">
          <Input
            placeholder={t("searchPlaceholder")}
            className="max-w-md"
            aria-label={t("searchPlaceholder")}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

          {loading && (
            <div className="flex justify-center py-6">
              <Spinner />
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {t("error")}
            </p>
          )}

          <ScrollArea className="h-[90%] pr-1">
            <div className="grid auto-rows-[1fr] gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  t={t}
                  onEdit={editOrder}
                  editLabel={formT("actions.edit")}
                />
              ))}

              {!loading && filteredOrders.length === 0 && (
                <p className="text-sm text-muted-foreground">{t("empty")}</p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
