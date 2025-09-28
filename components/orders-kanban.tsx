"use client"
import type { Order } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle, Package, ArrowRight } from "lucide-react"
import { useRealtimeOrders } from "@/hooks/use-realtime-orders"

interface OrdersKanbanProps {
  orders: Order[]
}

const statusColumns = [
  { id: "pending", title: "Pending", icon: Clock, color: "text-yellow-500" },
  { id: "confirmed", title: "Confirmed", icon: CheckCircle, color: "text-blue-500" },
  { id: "preparing", title: "Preparing", icon: Package, color: "text-orange-500" },
  { id: "ready", title: "Ready", icon: CheckCircle, color: "text-green-500" },
  { id: "completed", title: "Completed", icon: CheckCircle, color: "text-green-600" },
]

export function OrdersKanban({ orders: initialOrders }: OrdersKanbanProps) {
  const orders = useRealtimeOrders(initialOrders)
  const supabase = createClient()

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({
          status: newStatus,
          ...(newStatus === "ready" && { estimated_ready_time: new Date().toISOString() }),
          ...(newStatus === "completed" && { actual_ready_time: new Date().toISOString() }),
        })
        .eq("id", orderId)

      if (error) throw error

      const order = orders.find((o) => o.id === orderId)
      if (order) {
        await supabase.from("notifications").insert({
          user_id: order.user_id,
          title: "Order Status Updated",
          message: `Your order #${orderId.slice(0, 8)} is now ${newStatus}`,
          type: "order_update",
          is_read: false,
        })
      }
    } catch (error) {
      console.error("Error updating order status:", error)
    }
  }

  const getNextStatus = (currentStatus: string) => {
    const currentIndex = statusColumns.findIndex((col) => col.id === currentStatus)
    return currentIndex < statusColumns.length - 1 ? statusColumns[currentIndex + 1].id : null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {statusColumns.map((column) => {
        const columnOrders = orders.filter((order) => order.status === column.id)
        const Icon = column.icon

        return (
          <div key={column.id} className="space-y-4">
            <Card className="gradient-card backdrop-blur-sm border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icon className={`w-5 h-5 ${column.color}`} />
                  {column.title}
                </CardTitle>
                <CardDescription>{columnOrders.length} orders</CardDescription>
              </CardHeader>
            </Card>

            <div className="space-y-3">
              {columnOrders.map((order) => {
                const nextStatus = getNextStatus(order.status)

                return (
                  <Card key={order.id} className="gradient-card backdrop-blur-sm border-border/50">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">#{order.id.slice(0, 8)}</CardTitle>
                        <Badge variant="outline">${order.total_amount}</Badge>
                      </div>
                      <CardDescription className="text-xs">
                        {new Date(order.created_at).toLocaleString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Payment:</span>
                          <span className="capitalize">{order.payment_status}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Method:</span>
                          <span className="capitalize">{order.payment_method}</span>
                        </div>
                      </div>

                      {order.special_instructions && (
                        <div className="text-xs">
                          <span className="text-muted-foreground">Notes:</span>
                          <p className="text-foreground mt-1">{order.special_instructions}</p>
                        </div>
                      )}

                      {nextStatus && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, nextStatus)}
                          className="w-full gradient-primary hover:opacity-90 transition-opacity"
                        >
                          <ArrowRight className="w-3 h-3 mr-1" />
                          Move to {statusColumns.find((col) => col.id === nextStatus)?.title}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )
              })}

              {columnOrders.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Icon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No orders</p>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
