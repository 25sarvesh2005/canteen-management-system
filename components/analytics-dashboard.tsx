"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users } from "lucide-react"
import type { Order, MenuItem, InventoryItem, UserStats } from "@/lib/types"

interface AnalyticsDashboardProps {
  orders: Order[]
  menuItems: (MenuItem & { order_items: { quantity: number; total_price: number }[] })[]
  inventory: InventoryItem[]
  userStats: UserStats[]
}

const COLORS = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"]

export function AnalyticsDashboard({ orders, menuItems, inventory, userStats }: AnalyticsDashboardProps) {
  const analytics = useMemo(() => {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Revenue analytics
    const revenueData = orders
      .filter((order) => order.status === "completed" && new Date(order.created_at) >= thirtyDaysAgo)
      .reduce(
        (acc, order) => {
          const date = new Date(order.created_at).toLocaleDateString()
          acc[date] = (acc[date] || 0) + order.total_amount
          return acc
        },
        {} as Record<string, number>,
      )

    const dailyRevenue = Object.entries(revenueData)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Order analytics
    const totalOrders = orders.length
    const completedOrders = orders.filter((order) => order.status === "completed").length
    const totalRevenue = orders
      .filter((order) => order.status === "completed")
      .reduce((sum, order) => sum + order.total_amount, 0)

    const weeklyOrders = orders.filter((order) => new Date(order.created_at) >= sevenDaysAgo).length
    const previousWeekOrders = orders.filter(
      (order) =>
        new Date(order.created_at) >= new Date(sevenDaysAgo.getTime() - 7 * 24 * 60 * 60 * 1000) &&
        new Date(order.created_at) < sevenDaysAgo,
    ).length

    const orderGrowth = previousWeekOrders > 0 ? ((weeklyOrders - previousWeekOrders) / previousWeekOrders) * 100 : 0

    // Popular items
    const itemPopularity = menuItems
      .map((item) => ({
        name: item.name,
        orders: item.order_items?.reduce((sum, orderItem) => sum + orderItem.quantity, 0) || 0,
        revenue: item.order_items?.reduce((sum, orderItem) => sum + orderItem.total_price, 0) || 0,
      }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 10)

    // Order status distribution
    const statusDistribution = orders.reduce(
      (acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const statusData = Object.entries(statusDistribution).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
    }))

    // Peak hours analysis
    const hourlyOrders = orders.reduce(
      (acc, order) => {
        const hour = new Date(order.created_at).getHours()
        acc[hour] = (acc[hour] || 0) + 1
        return acc
      },
      {} as Record<number, number>,
    )

    const peakHoursData = Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour}:00`,
      orders: hourlyOrders[hour] || 0,
    }))

    // Customer analytics
    const activeUsers = userStats.filter((stat) => stat.total_orders > 0).length
    const averageOrderValue = totalRevenue / completedOrders || 0
    const topCustomers = userStats
      .sort((a, b) => b.total_spent - a.total_spent)
      .slice(0, 5)
      .map((stat) => ({
        userId: stat.user_id,
        totalSpent: stat.total_spent,
        totalOrders: stat.total_orders,
        loyaltyPoints: stat.loyalty_points,
      }))

    return {
      dailyRevenue,
      totalOrders,
      completedOrders,
      totalRevenue,
      orderGrowth,
      itemPopularity,
      statusData,
      peakHoursData,
      activeUsers,
      averageOrderValue,
      topCustomers,
    }
  }, [orders, menuItems, userStats])

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4 gradient-card border-border/50">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="sales">Sales</TabsTrigger>
        <TabsTrigger value="menu">Menu Performance</TabsTrigger>
        <TabsTrigger value="customers">Customers</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="gradient-card backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">From {analytics.completedOrders} completed orders</p>
            </CardContent>
          </Card>

          <Card className="gradient-card backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-chart-2" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalOrders}</div>
              <div className="flex items-center text-xs">
                {analytics.orderGrowth >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={analytics.orderGrowth >= 0 ? "text-green-500" : "text-red-500"}>
                  {Math.abs(analytics.orderGrowth).toFixed(1)}%
                </span>
                <span className="text-muted-foreground ml-1">vs last week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-chart-3" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.activeUsers}</div>
              <p className="text-xs text-muted-foreground">Users with orders</p>
            </CardContent>
          </Card>

          <Card className="gradient-card backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-chart-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics.averageOrderValue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Per completed order</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="gradient-card backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Order Status Distribution</CardTitle>
              <CardDescription>Current order statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, count }) => `${status}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics.statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="gradient-card backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Peak Hours</CardTitle>
              <CardDescription>Orders by hour of day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.peakHoursData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="orders" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="sales" className="space-y-6">
        <Card className="gradient-card backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>Daily Revenue (Last 30 Days)</CardTitle>
            <CardDescription>Revenue trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={analytics.dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, "Revenue"]} />
                <Line type="monotone" dataKey="revenue" stroke="#06b6d4" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="menu" className="space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="gradient-card backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Most Popular Items</CardTitle>
              <CardDescription>Top 10 items by order count</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analytics.itemPopularity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="gradient-card backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Revenue by Item</CardTitle>
              <CardDescription>Top revenue generating items</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analytics.itemPopularity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, "Revenue"]} />
                  <Bar dataKey="revenue" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="gradient-card backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>Menu Performance Insights</CardTitle>
            <CardDescription>AI-powered recommendations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg gradient-accent">
                <h4 className="font-semibold text-sm mb-2">Top Performer</h4>
                <p className="text-sm text-muted-foreground">
                  <strong>{analytics.itemPopularity[0]?.name}</strong> is your most popular item with{" "}
                  {analytics.itemPopularity[0]?.orders} orders
                </p>
              </div>
              <div className="p-4 rounded-lg gradient-accent">
                <h4 className="font-semibold text-sm mb-2">Revenue Leader</h4>
                <p className="text-sm text-muted-foreground">
                  <strong>{analytics.itemPopularity.sort((a, b) => b.revenue - a.revenue)[0]?.name}</strong> generates
                  the highest revenue
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="customers" className="space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="gradient-card backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Top Customers</CardTitle>
              <CardDescription>Highest spending customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topCustomers.map((customer, index) => (
                  <div
                    key={customer.userId}
                    className="flex items-center justify-between p-3 rounded-lg gradient-accent"
                  >
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <div>
                        <p className="font-medium">Customer {customer.userId.slice(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">{customer.totalOrders} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${customer.totalSpent.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">{customer.loyaltyPoints} points</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Customer Insights</CardTitle>
              <CardDescription>Understanding your customer base</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Customer Retention</span>
                    <span>
                      {userStats.filter((stat) => stat.total_orders > 1).length}/{analytics.activeUsers} (
                      {(
                        (userStats.filter((stat) => stat.total_orders > 1).length / analytics.activeUsers) *
                        100
                      ).toFixed(1)}
                      %)
                    </span>
                  </div>
                  <Progress
                    value={(userStats.filter((stat) => stat.total_orders > 1).length / analytics.activeUsers) * 100}
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Loyalty Program Adoption</span>
                    <span>
                      {userStats.filter((stat) => stat.loyalty_points > 0).length}/{analytics.activeUsers} (
                      {(
                        (userStats.filter((stat) => stat.loyalty_points > 0).length / analytics.activeUsers) *
                        100
                      ).toFixed(1)}
                      %)
                    </span>
                  </div>
                  <Progress
                    value={(userStats.filter((stat) => stat.loyalty_points > 0).length / analytics.activeUsers) * 100}
                    className="h-2"
                  />
                </div>

                <div className="pt-4 space-y-2">
                  <div className="p-3 rounded-lg gradient-accent">
                    <h4 className="font-semibold text-sm mb-1">Average Customer Value</h4>
                    <p className="text-sm text-muted-foreground">
                      ${(userStats.reduce((sum, stat) => sum + stat.total_spent, 0) / analytics.activeUsers).toFixed(2)}{" "}
                      per customer
                    </p>
                  </div>
                  <div className="p-3 rounded-lg gradient-accent">
                    <h4 className="font-semibold text-sm mb-1">Most Loyal Customer</h4>
                    <p className="text-sm text-muted-foreground">
                      {Math.max(...userStats.map((stat) => stat.streak_days))} day streak record
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  )
}
