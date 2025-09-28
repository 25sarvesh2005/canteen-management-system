"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { InventoryItem } from "@/lib/types"

export function useRealtimeInventory(initialItems: InventoryItem[]) {
  const [items, setItems] = useState<InventoryItem[]>(initialItems)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel("inventory-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "inventory",
        },
        (payload) => {
          console.log("[v0] Real-time inventory update:", payload)

          if (payload.eventType === "INSERT") {
            const newItem = payload.new as InventoryItem
            setItems((prev) => [...prev, newItem])
          } else if (payload.eventType === "UPDATE") {
            const updatedItem = payload.new as InventoryItem
            setItems((prev) => prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)))
          } else if (payload.eventType === "DELETE") {
            const deletedItem = payload.old as InventoryItem
            setItems((prev) => prev.filter((item) => item.id !== deletedItem.id))
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return items
}
