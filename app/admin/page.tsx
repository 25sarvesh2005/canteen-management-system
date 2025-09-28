import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getProfile, getAllOrders, getInventoryItems } from "@/lib/database"
import { AdminNav } from "@/components/admin-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ShoppingCart, TrendingUp, AlertTriangle, Clock } from "lucide-react"

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const profile = await getProfile(user.id)
  if (!profile || profile.role !== "admin") {
    redirect("/auth/login")
  }

  const [orders, inventoryItems] = await Promise.all([getAllOrders(), getInventoryItems()])

  // Calculate stats
  const todayOrders = orders.filter((order) => {
    const today = new Date().toDateString()
    return new Date(order.created_at).toDateString() === today
  })

  const pendingOrders = orders.filter((order) => order.status === "pending").length
  const preparingOrders = orders.filter((order) => order.status === "preparing").length
  const completedToday = todayOrders.filter((order) => order.status === "completed").length

  const todayRevenue = todayOrders
    .filter((order) => order.status === "completed")
    .reduce((sum, order) => sum + order.total_amount, 0)

  const lowStockItems = inventoryItems.filter((item) => item.current_stock <= item.minimum_stock)

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="container mx-auto max-w-7xl">
        <AdminNav profile={profile} />

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage your canteen operations</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="gradient-card backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayOrders.length}</div>
              <p className="text-xs text-muted-foreground">{completedToday} completed</p>
            </CardContent>
          </Card>

          <Card className="gradient-card backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-chart-2" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${todayRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">From {completedToday} orders</p>
            </CardContent>
          </Card>

          <Card className="gradient-card backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingOrders}</div>
              <p className="text-xs text-muted-foreground">{preparingOrders} preparing</p>
            </CardContent>
          </Card>

          <Card className="gradient-card backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lowStockItems.length}</div>
              <p className="text-xs text-muted-foreground">Need restocking</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <Card className="gradient-card backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 rounded-lg gradient-accent">
                      <div>
                        <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${order.total_amount}</p>
                        <Badge
                          variant={
                            order.status === "completed"
                              ? "default"
                              : order.status === "preparing"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Inventory Alerts */}
          <div>
            <Card className="gradient-card backdrop-blur-sm border-border/50 mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Inventory Alerts
                </CardTitle>
                <CardDescription>Items requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                {lowStockItems.length > 0 ? (
                  <div className="space-y-3">
                    {lowStockItems.slice(0, 5).map((item) => (
                      <div key={item.id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{item.item_name}</span>
                          <span className="text-destructive">
                            {item.current_stock} {item.unit}
                          </span>
                        </div>
                        <Progress value={(item.current_stock / item.maximum_stock) * 100} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          Min: {item.minimum_stock} {item.unit}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">All items well stocked</p>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="gradient-card backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Today's performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Order Completion Rate</span>
                  <span className="font-medium">
                    {todayOrders.length > 0 ? Math.round((completedToday / todayOrders.length) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Average Order Value</span>
                  <span className="font-medium">
                    ${todayOrders.length > 0 ? (todayRevenue / completedToday || 0).toFixed(2) : "0.00"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Inventory Items</span>
                  <span className="font-medium">{inventoryItems.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
