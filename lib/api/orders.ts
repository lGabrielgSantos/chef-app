import { api } from "./index"
import {
  orderFromDto,
  type Order,
  type OrderDTO,
  type OrderPayload,
} from "@/lib/dto/order"

type OrdersApiResponse = {
  id: number
  customer_id?: number | null
  customer_name?: string | null
  customers?: {
    id: number
    name: string
    email: string
    phone: string
    city: string
    created_at: string
    updated_at: string
    user_id: string
  }
  order_date?: string | null
  created_at?: string | null
  updated_at?: string | null
  user_id?: string | null
  total?: number | null
  order_items_count?: number
  order_items?: Array<{
    id: number
    order_id: number
    product_id: number
    quantity: number
    created_at: string
    updated_at: string
  }>
}

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

export async function fetchOrders(): Promise<Order[]> {
  const response = await api.get("/orders")
  const payload = unwrapData<OrdersApiResponse[] | { orders: OrdersApiResponse[] }>(
    response.data,
  )
  const orders = Array.isArray(payload) ? payload : payload?.orders ?? []

  const formattedOrders: OrderDTO[] = orders.map((order) => ({
    id: order.id,
    customer_id: order.customer_id ?? order.customers?.id ?? null,
    order_date: order.order_date ?? null,
    total: order.total ?? 0,
    created_at: order.created_at ?? null,
    updated_at: order.updated_at ?? null,
    user_id: order.user_id ?? null,
    order_items:
      order.order_items?.map((item) => ({
        id: item.id,
        order_id: item.order_id,
        product_id: item.product_id,
        quantity: item.quantity,
        created_at: item.created_at,
        updated_at: item.updated_at,
      })) ?? [],
  }))

  return formattedOrders.map(orderFromDto)
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
