"use client"

import { useCallback, useEffect, useState } from "react"

import {
  createOrder,
  deleteOrder,
  fetchOrder,
  fetchOrders,
  updateOrder,
} from "@/lib/api/orders"
import type { Order, OrderPayload } from "@/lib/dto/order"

interface UseOrdersOptions {
  autoFetch?: boolean
}

interface UseOrdersReturn {
  orders: Order[]
  loading: boolean
  error: Error | null
  loadOrders: () => Promise<void>
  getOrderById: (id: string) => Promise<Order>
  addOrder: (data: OrderPayload) => Promise<Order>
  editOrder: (id: string, data: Partial<OrderPayload>) => Promise<Order>
  removeOrder: (id: string) => Promise<void>
}

export function useOrders(
  options: UseOrdersOptions = { autoFetch: true },
): UseOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { autoFetch = true } = options

  const handleError = useCallback((err: unknown) => {
    const normalizedError =
      err instanceof Error ? err : new Error("Unable to load orders.")
    setError(normalizedError)
    return normalizedError
  }, [])

  const loadOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchOrders()
      setOrders(data)
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }, [handleError])

  const getOrderById = useCallback(
    async (id: string) => {
      try {
        return await fetchOrder(id)
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
        setOrders((prev) => [created, ...prev])
        return created
      } catch (err) {
        throw handleError(err)
      }
    },
    [handleError],
  )

  const editOrder = useCallback(
    async (id: string, data: Partial<OrderPayload>) => {
      try {
        const updated = await updateOrder(id, data)
        setOrders((prev) =>
          prev.map((order) => (order.id === id ? { ...order, ...updated } : order)),
        )
        return updated
      } catch (err) {
        throw handleError(err)
      }
    },
    [handleError],
  )

  const removeOrder = useCallback(
    async (id: string) => {
      try {
        await deleteOrder(id)
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
