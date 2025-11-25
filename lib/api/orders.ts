import { api } from "./index"
import {
  orderFromDto,
  type Order,
  type OrderDTO,
  type OrderPayload,
} from "@/lib/dto/order"

function unwrapData<T>(responseData: any): T {
  return (responseData?.data ?? responseData) as T
}

function normalizePayload(data: Partial<OrderPayload>) {
  const items = (data.items ?? (data as any).orderItems) ?? []

  return {
    customer_id: data.customerId ?? null,
    order_date: data.orderDate ?? null,
    total: data.total ?? 0,
    order_items: items.map((item) => ({
      id: item.id,
      product_id: item.productId,
      quantity: item.quantity,
    })),
  }
}

export async function fetchOrders(): Promise<Order[]> {
  const response = await api.get("/orders")
  const payload = unwrapData<OrderDTO[] | { orders: OrderDTO[] }>(
    response.data,
  )
  const orders = Array.isArray(payload) ? payload : payload?.orders ?? []

  return orders.map(orderFromDto)
}

export async function fetchOrder(id: string): Promise<Order> {
  const response = await api.get(`/orders/${id}`)
  const payload = unwrapData<OrderDTO | { order: OrderDTO }>(response.data)
  const order = Array.isArray(payload)
    ? payload[0]
    : (payload as { order?: OrderDTO }).order ?? payload

  return orderFromDto(order)
}

export async function createOrder(data: OrderPayload): Promise<Order> {
  const response = await api.post("/orders", normalizePayload(data))
  const payload = unwrapData<OrderDTO | { order: OrderDTO }>(response.data)

  return orderFromDto((payload as { order?: OrderDTO }).order ?? payload)
}

export async function updateOrder(
  id: string,
  data: Partial<OrderPayload>,
): Promise<Order> {
  const response = await api.put(`/orders/${id}`, normalizePayload(data))
  const payload = unwrapData<OrderDTO | { order: OrderDTO }>(response.data)

  return orderFromDto((payload as { order?: OrderDTO }).order ?? payload)
}

export async function deleteOrder(id: string): Promise<void> {
  await api.delete(`/orders/${id}`)
}

export type { Order, OrderDTO, OrderPayload } from "@/lib/dto/order"
