import { api } from "./index"
import {
  orderFromDto,
  OrdersApiResponse,
  type Order,
  type OrderDTO,
  type OrderPayload,
} from "@/lib/dto/order"

function unwrapData<T>(responseData: unknown): T {
  const maybeEnvelope = responseData as { data?: unknown }
  const data = maybeEnvelope?.data
  return (data ?? responseData) as T
}

function normalizePayload(data: Partial<OrderPayload>) {
  const legacyItems = (data as { orderItems?: OrderPayload["items"] }).orderItems
  const items = data.items ?? legacyItems ?? []

  return {
    customer_id: data.customerId ?? null,
    order_date: data.orderDate ?? null,
    total: data.total ?? 0,
    notes: data.notes ?? null,
    order_items: items.map((item) => ({
      id: item.id,
      product_id: item.productId,
      quantity: item.quantity,
    })),
  }
}

export async function fetchOrders(): Promise<OrdersApiResponse[]> {
  const response = await api.get("/orders")
  const payload = unwrapData<OrdersApiResponse[] | { orders: OrdersApiResponse[] }>(
    response.data,
  )
  console.log("Fetched orders payload:", payload)
  return payload.orders ?? payload
}

export async function fetchOrderById(id: number): Promise<Order> {
  const response = await api.get(`/orders/${id}`)
  const payload = unwrapData<OrderDTO | { order: OrderDTO }>(response.data)
  const order = Array.isArray(payload)
    ? payload[0]
    : (payload as { order?: OrderDTO }).order ?? payload

  return orderFromDto(order)
}

export async function fetchOrder(id: string): Promise<Order> {
  return fetchOrderById(Number(id))
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

export type { Order, OrderDTO, OrderPayload, OrdersApiResponse } from "@/lib/dto/order"
