"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { Trophy, Star, Flame, DollarSign } from "lucide-react"
import type { Order, UserStats } from "@/lib/types"

interface StudentStatsViewProps {
  userStats: UserStats | null
  orders: Order[]
}

export function StudentStatsView({ userStats, orders }: StudentStatsViewProps) {
  const analytics = useMemo(() => {
    if (!userStats) return null

    // Monthly spending analysis
    const monthlySpending = orders
      .filter((order) => order.status === "completed")
      .reduce(
        (acc, order) => {
          const month = new Date(order.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
          acc[month] = (acc[month] || 0) + order.total_amount
          return acc
        },
        {} as Record<string, number>,
      )

    const spendingData = Object.entries(monthlySpending)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())

    // Order frequency analysis
    const ordersByDay = orders.reduce(
      (acc, order) => {
        const day = new Date(order.created_at).toLocaleDateString("en-US", { weekday: "long" })
        acc[day] = (acc[day] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const frequencyData = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => ({
      day,
      orders: ordersByDay[day] || 0,
    }))

    // Achievements calculation
    const achievements = []
    if (userStats.total_orders >= 1)
      achievements.push({ name: "First Order", icon: Star, description: "Placed your first order" })
    if (userStats.total_orders >= 5)
      achievements.push({ name: "Regular Customer", icon: Trophy, description: "Completed 5 orders" })
    if (userStats.total_orders >= 10)
      achievements.push({ name: "Frequent Diner", icon: Trophy, description: "Completed 10 orders" })
    if (userStats.total_orders >= 25)
      achievements.push({ name: "Canteen Champion", icon: Trophy, description: "Completed 25 orders" })
    if (userStats.streak_days >= 3)
      achievements.push({ name: "On Fire", icon: Flame, description: "3-day ordering streak" })
    if (userStats.streak_days >= 7)
      achievements.push({ name: "Week Warrior", icon: Flame, description: "7-day ordering streak" })
    if (userStats.total_spent >= 50)
      achievements.push({ name: "Big Spender", icon: DollarSign, description: "Spent over $50" })
    if (userStats.total_spent >= 100)
      achievements.push({ name: "VIP Customer", icon: DollarSign, description: "Spent over $100" })

    // Loyalty tier calculation
    const loyaltyTiers = [
      { name: "Bronze", min: 0, max: 99, color: "text-orange-600" },
      { name: "Silver", min: 100, max: 249, color: "text-gray-400" },
      { name: "Gold", min: 250, max: 499, color: "text-yellow-500" },
      { name: "Platinum", min: 500, max: 999, color: "text-purple-500" },
      { name: "Diamond", min: 1000, max: Number.POSITIVE_INFINITY, color: "text-blue-500" },
    ]

    const currentTier = loyaltyTiers.find(
      (tier) => userStats.loyalty_points >= tier.min && userStats.loyalty_points <= tier.max,
    )
    const nextTier = loyaltyTiers.find((tier) => tier.min > userStats.loyalty_points)

    return {
      spendingData,
      frequencyData,
      achievements,
      currentTier,
      nextTier,
    }
  }, [userStats, orders])

  if (!userStats || !analytics) {
    return (
      <Card className="gradient-card backdrop-blur-sm border-border/50">
        <CardContent className="text-center py-12">
          <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No stats available</h3>
          <p className="text-muted-foreground">Start ordering to see your dining statistics</p>
        </CardContent>
      </Card>
    )
  }

  const progressToNextTier = analytics.nextTier
    ? ((userStats.loyalty_points - analytics.currentTier!.min) /
        (analytics.nextTier.min - analytics.currentTier!.min)) *
      100
    : 100

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3 gradient-card border-border/50">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="achievements">Achievements</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="gradient-card backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Trophy className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.total_orders}</div>
              <p className="text-xs text-muted-foreground">Lifetime orders</p>
            </CardContent>
          </Card>

          <Card className="gradient-card backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-chart-2" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${userStats.total_spent.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">All time spending</p>
            </CardContent>
          </Card>

          <Card className="gradient-card backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loyalty Points</CardTitle>
              <Star className="h-4 w-4 text-chart-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.loyalty_points}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.nextTier
                  ? `${analytics.nextTier.min - userStats.loyalty_points} to ${analytics.nextTier.name}`
                  : "Max tier reached"}
              </p>
            </CardContent>
          </Card>

          <Card className="gradient-card backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Flame className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.streak_days}</div>
              <p className="text-xs text-muted-foreground">Consecutive days</p>
            </CardContent>
          </Card>
        </div>

        {/* Loyalty Progress */}
        <Card className="gradient-card backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className={`w-5 h-5 ${analytics.currentTier?.color}`} />
              Loyalty Status: {analytics.currentTier?.name}
            </CardTitle>
            <CardDescription>Your progress in the loyalty program</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.nextTier && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress to {analytics.nextTier.name}</span>
                  <span>
                    {userStats.loyalty_points} / {analytics.nextTier.min} points
                  </span>
                </div>
                <Progress value={progressToNextTier} className="h-3" />
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.nextTier.min - userStats.loyalty_points} points to next tier
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-center">
              {[
                { name: "Bronze", min: 0, color: "text-orange-600" },
                { name: "Silver", min: 100, color: "text-gray-400" },
                { name: "Gold", min: 250, color: "text-yellow-500" },
                { name: "Platinum", min: 500, color: "text-purple-500" },
                { name: "Diamond", min: 1000, color: "text-blue-500" },
              ].map((tier) => (
                <div key={tier.name} className="space-y-1">
                  <Badge
                    variant={userStats.loyalty_points >= tier.min ? "default" : "outline"}
                    className={userStats.loyalty_points >= tier.min ? tier.color : ""}
                  >
                    {tier.name}
                  </Badge>
                  <p className="text-xs text-muted-foreground">{tier.min}+ pts</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="analytics" className="space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="gradient-card backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Monthly Spending</CardTitle>
              <CardDescription>Your spending pattern over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.spendingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, "Spent"]} />
                  <Line type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="gradient-card backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Order Frequency</CardTitle>
              <CardDescription>Orders by day of the week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.frequencyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#06b6d4" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="gradient-card backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>Dining Insights</CardTitle>
            <CardDescription>Personalized recommendations based on your habits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg gradient-accent">
                <h4 className="font-semibold text-sm mb-2">Favorite Day</h4>
                <p className="text-sm text-muted-foreground">
                  You order most frequently on{" "}
                  <strong>
                    {analytics.frequencyData.reduce((max, day) => (day.orders > max.orders ? day : max)).day}
                  </strong>
                </p>
              </div>
              <div className="p-4 rounded-lg gradient-accent">
                <h4 className="font-semibold text-sm mb-2">Average Order</h4>
                <p className="text-sm text-muted-foreground">
                  Your average order value is{" "}
                  <strong>${(userStats.total_spent / userStats.total_orders).toFixed(2)}</strong>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="achievements" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {analytics.achievements.map((achievement) => {
            const Icon = achievement.icon
            return (
              <Card key={achievement.name} className="gradient-card backdrop-blur-sm border-border/50">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{achievement.name}</CardTitle>
                  <CardDescription>{achievement.description}</CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>

        {analytics.achievements.length === 0 && (
          <Card className="gradient-card backdrop-blur-sm border-border/50">
            <CardContent className="text-center py-12">
              <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No achievements yet</h3>
              <p className="text-muted-foreground">Start ordering to unlock achievements</p>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  )
}
