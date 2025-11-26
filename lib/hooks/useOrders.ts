"use client"

import { useCallback, useEffect, useState } from "react"

import {
  createOrder,
  deleteOrder,
  fetchOrderById,
  fetchOrders,
  updateOrder,
  type OrdersApiResponse,
} from "@/lib/api/orders"
import type { Order, OrderPayload } from "@/lib/dto/order"

interface UseOrdersOptions {
  autoFetch?: boolean
}

interface UseOrdersReturn {
  orders: OrdersApiResponse[]
  loading: boolean
  error: Error | null
  loadOrders: () => Promise<void>
  getOrderById: (id: number) => Promise<Order>
  addOrder: (data: OrderPayload) => Promise<Order>
  editOrder: (id: number, data: Partial<OrderPayload>) => Promise<Order>
  removeOrder: (id: number) => Promise<void>
}

export function useOrders(
  options: UseOrdersOptions = { autoFetch: true },
): UseOrdersReturn {
  const [orders, setOrders] = useState<OrdersApiResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { autoFetch = true } = options

  const handleError = useCallback((err: unknown) => {
    const normalizedError =
      err instanceof Error ? err : new Error("Unable to load orders.")
    setError(normalizedError)
    return normalizedError
  }, [])

  const refreshOrders = useCallback(async () => {
    const data = await fetchOrders()
    setOrders(data)
    return data
  }, [])

  const loadOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await refreshOrders()
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }, [handleError, refreshOrders])

  const getOrderById = useCallback(
    async (id: number) => {
      try {
        return await fetchOrderById(id)
      } catch (err) {
        throw handleError(err)
      }
    },
    [handleError],
  )

  const addOrder = useCallback(
    async (data: OrderPayload) => {
      try {
        const created = await createOrder(data)
        await refreshOrders()
        return created
      } catch (err) {
        throw handleError(err)
      }
    },
    [handleError, refreshOrders],
  )

  const editOrder = useCallback(
    async (id: number, data: Partial<OrderPayload>) => {
      try {
        const updated = await updateOrder(String(id), data)
        await refreshOrders()
        return updated
      } catch (err) {
        throw handleError(err)
      }
    },
    [handleError, refreshOrders],
  )

  const removeOrder = useCallback(
    async (id: number) => {
      try {
        await deleteOrder(String(id))
        setOrders((prev) => prev.filter((order) => order.id !== id))
      } catch (err) {
        throw handleError(err)
      }
    },
    [handleError],
  )

  useEffect(() => {
    if (autoFetch) {
      loadOrders()
    }
  }, [autoFetch, loadOrders])

  return {
    orders,
    loading,
    error,
    loadOrders,
    getOrderById,
    addOrder,
    editOrder,
    removeOrder,
  }
}
