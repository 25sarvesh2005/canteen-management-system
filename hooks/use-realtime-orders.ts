"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Order } from "@/lib/types"

export function useRealtimeOrders(initialOrders: Order[]) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel("orders-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          console.log("[v0] Real-time order update:", payload)

          if (payload.eventType === "INSERT") {
            const newOrder = payload.new as Order
            setOrders((prev) => [newOrder, ...prev])
          } else if (payload.eventType === "UPDATE") {
            const updatedOrder = payload.new as Order
            setOrders((prev) => prev.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)))
          } else if (payload.eventType === "DELETE") {
            const deletedOrder = payload.old as Order
            setOrders((prev) => prev.filter((order) => order.id !== deletedOrder.id))
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return orders
}
