"use client"

import { useState } from "react"
import type { InventoryItem } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, Package, Plus, Minus } from "lucide-react"
import { useRealtimeInventory } from "@/hooks/use-realtime-inventory"

interface InventoryTableProps {
  items: InventoryItem[]
}

export function InventoryTable({ items: initialItems }: InventoryTableProps) {
  const items = useRealtimeInventory(initialItems)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const supabase = createClient()

  const updateStock = async (itemId: string, newStock: number) => {
    setIsUpdating(itemId)
    try {
      const item = items.find((i) => i.id === itemId)
      const isRestock = newStock > (item?.current_stock || 0)

      const { error } = await supabase
        .from("inventory")
        .update({
          current_stock: newStock,
          last_restocked: isRestock ? new Date().toISOString() : undefined,
        })
        .eq("id", itemId)

      if (error) throw error

      if (item && newStock <= item.minimum_stock) {
        // Get all admin users
        const { data: admins } = await supabase.from("profiles").select("id").eq("role", "admin")

        if (admins) {
          const notifications = admins.map((admin) => ({
            user_id: admin.id,
            title: "Low Stock Alert",
            message: `${item.item_name} is running low (${newStock} ${item.unit} remaining)`,
            type: "inventory_alert",
            is_read: false,
          }))

          await supabase.from("notifications").insert(notifications)
        }
      }
    } catch (error) {
      console.error("Error updating stock:", error)
    } finally {
      setIsUpdating(null)
    }
  }

  const getStockStatus = (item: InventoryItem) => {
    if (item.current_stock <= item.minimum_stock) return "critical"
    if (item.current_stock <= item.minimum_stock * 1.5) return "low"
    return "good"
  }

  const getStockColor = (status: string) => {
    switch (status) {
      case "critical":
        return "text-destructive"
      case "low":
        return "text-yellow-500"
      default:
        return "text-green-500"
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="gradient-card backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.length}</div>
            <p className="text-xs text-muted-foreground">Inventory items</p>
          </CardContent>
        </Card>

        <Card className="gradient-card backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.filter((item) => getStockStatus(item) === "low").length}</div>
            <p className="text-xs text-muted-foreground">Items need restocking</p>
          </CardContent>
        </Card>

        <Card className="gradient-card backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {items.filter((item) => getStockStatus(item) === "critical").length}
            </div>
            <p className="text-xs text-muted-foreground">Items critically low</p>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
          const status = getStockStatus(item)
          const stockPercentage = (item.current_stock / item.maximum_stock) * 100

          return (
            <Card key={item.id} className="gradient-card backdrop-blur-sm border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-balance">{item.item_name}</CardTitle>
                  <Badge variant={status === "critical" ? "destructive" : status === "low" ? "secondary" : "default"}>
                    {status}
                  </Badge>
                </div>
                <CardDescription>Supplier: {item.supplier}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current Stock</span>
                    <span className={`font-medium ${getStockColor(status)}`}>
                      {item.current_stock} {item.unit}
                    </span>
                  </div>
                  <Progress value={stockPercentage} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Min: {item.minimum_stock}</span>
                    <span>Max: {item.maximum_stock}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Cost per unit:</span>
                    <div className="font-medium">${item.cost_per_unit}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Expires:</span>
                    <div className="font-medium">{new Date(item.expiry_date).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateStock(item.id, Math.max(0, item.current_stock - 1))}
                    disabled={isUpdating === item.id || item.current_stock <= 0}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <Input
                    type="number"
                    value={item.current_stock}
                    onChange={(e) => {
                      const newValue = Number.parseInt(e.target.value) || 0
                      updateStock(item.id, newValue)
                    }}
                    className="text-center"
                    min="0"
                    max={item.maximum_stock}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateStock(item.id, Math.min(item.maximum_stock, item.current_stock + 1))}
                    disabled={isUpdating === item.id || item.current_stock >= item.maximum_stock}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>

                {item.last_restocked && (
                  <p className="text-xs text-muted-foreground">
                    Last restocked: {new Date(item.last_restocked).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
