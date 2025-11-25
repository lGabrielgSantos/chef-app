export interface OrderItemDTO {
  id?: string | number
  _id?: string
  order_id?: string | number | null
  orderId?: string | number | null
  product_id?: string | number | null
  productId?: string | number | null
  quantity?: number | string | null
  created_at?: string | null
  updated_at?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface OrderDTO {
  id?: string | number
  _id?: string
  customer_id?: string | number | null
  customerId?: string | number | null
  order_date?: string | null
  orderDate?: string | null
  total?: string | number | null
  created_at?: string | null
  updated_at?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  user_id?: string | null
  order_items?: OrderItemDTO[]
  orderItems?: OrderItemDTO[]
}

export interface OrderItem {
  id: string
  orderId?: string | null
  productId?: string | null
  quantity: number
}

export interface OrderPayload {
  customerId?: string | null
  orderDate?: string | null
  total?: number | null
  items?: Array<{
    id?: string
    productId?: string | null
    quantity: number
  }>
}

export interface Order extends OrderPayload {
  id: string
  createdAt?: string | null
  updatedAt?: string | null
  orderItems?: OrderItem[]
}

function toNumeric(value: string | number | null | undefined): number {
  if (typeof value === "number") {
    return value
  }
  if (typeof value === "string") {
    const parsed = parseFloat(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

export function orderItemFromDto(payload: OrderItemDTO): OrderItem {
  if (!payload) {
    throw new Error("Invalid order item payload")
  }

  return {
    id: String(payload.id ?? payload._id ?? ""),
    orderId:
      payload.order_id !== undefined && payload.order_id !== null
        ? String(payload.order_id)
        : payload.orderId !== undefined && payload.orderId !== null
          ? String(payload.orderId)
          : null,
    productId:
      payload.product_id !== undefined && payload.product_id !== null
        ? String(payload.product_id)
        : payload.productId !== undefined && payload.productId !== null
          ? String(payload.productId)
          : null,
    quantity: toNumeric(payload.quantity),
  }
}

export function orderFromDto(payload: OrderDTO): Order {
  if (!payload) {
    throw new Error("Invalid order payload")
  }

  const items = payload.order_items ?? payload.orderItems ?? []

  return {
    id: String(payload.id ?? payload._id ?? ""),
    customerId:
      payload.customer_id !== undefined && payload.customer_id !== null
        ? String(payload.customer_id)
        : payload.customerId !== undefined && payload.customerId !== null
          ? String(payload.customerId)
          : null,
    orderDate: payload.order_date ?? payload.orderDate ?? null,
    total: toNumeric(payload.total),
    createdAt: payload.created_at ?? payload.createdAt ?? null,
    updatedAt: payload.updated_at ?? payload.updatedAt ?? null,
    orderItems: items.map(orderItemFromDto),
  }
}

export type { OrderDTO as OrdersDTO }
