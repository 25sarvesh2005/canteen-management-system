"use client"

import type { Order } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, XCircle, Package } from "lucide-react"

interface OrdersListProps {
  orders: Order[]
}

export function OrdersList({ orders }: OrdersListProps) {
  if (orders.length === 0) {
    return (
      <Card className="gradient-card backdrop-blur-sm border-border/50">
        <CardContent className="text-center py-12">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
          <p className="text-muted-foreground">Your order history will appear here</p>
        </CardContent>
      </Card>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "cancelled":
        return "destructive"
      case "preparing":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id} className="gradient-card backdrop-blur-sm border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                <CardDescription>
                  {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold">${order.total_amount}</div>
                <Badge variant={getStatusColor(order.status) as any} className="mt-1">
                  {getStatusIcon(order.status)}
                  <span className="ml-1 capitalize">{order.status}</span>
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Payment Status:</span>
                <div className="font-medium capitalize">{order.payment_status}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Payment Method:</span>
                <div className="font-medium capitalize">{order.payment_method}</div>
              </div>
              {order.estimated_ready_time && (
                <div>
                  <span className="text-muted-foreground">Estimated Ready:</span>
                  <div className="font-medium">{new Date(order.estimated_ready_time).toLocaleTimeString()}</div>
                </div>
              )}
              {order.special_instructions && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Special Instructions:</span>
                  <div className="font-medium">{order.special_instructions}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
