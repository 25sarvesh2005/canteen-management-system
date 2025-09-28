import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getProfile, getUserStats, getUserOrders } from "@/lib/database"
import { StudentNav } from "@/components/student-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ShoppingCart, Clock, Trophy, TrendingUp, Star, Flame } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const profile = await getProfile(user.id)
  if (!profile || profile.role !== "student") {
    redirect("/auth/login")
  }

  const userStats = await getUserStats(user.id)
  const recentOrders = await getUserOrders(user.id)

  // Calculate progress to next loyalty tier
  const loyaltyPoints = userStats?.loyalty_points || 0
  const nextTierPoints = Math.ceil((loyaltyPoints + 1) / 100) * 100
  const progressToNextTier = ((loyaltyPoints % 100) / 100) * 100

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="container mx-auto max-w-7xl">
        <StudentNav profile={profile} />

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {profile.full_name?.split(" ")[0]}!</h1>
          <p className="text-muted-foreground">Ready for your next delicious meal?</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="gradient-card backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats?.total_orders || 0}</div>
              <p className="text-xs text-muted-foreground">Lifetime orders</p>
            </CardContent>
          </Card>

          <Card className="gradient-card backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <TrendingUp className="h-4 w-4 text-chart-2" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${userStats?.total_spent || 0}</div>
              <p className="text-xs text-muted-foreground">All time spending</p>
            </CardContent>
          </Card>

          <Card className="gradient-card backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loyalty Points</CardTitle>
              <Star className="h-4 w-4 text-chart-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loyaltyPoints}</div>
              <p className="text-xs text-muted-foreground">{nextTierPoints - loyaltyPoints} to next tier</p>
            </CardContent>
          </Card>

          <Card className="gradient-card backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Streak Days</CardTitle>
              <Flame className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats?.streak_days || 0}</div>
              <p className="text-xs text-muted-foreground">Consecutive days</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card className="gradient-card backdrop-blur-sm border-border/50 mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Get started with your next order</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button asChild className="gradient-primary hover:opacity-90 transition-opacity h-auto p-6">
                  <Link href="/menu" className="flex flex-col items-center space-y-2">
                    <ShoppingCart className="w-6 h-6" />
                    <span className="font-medium">Browse Menu</span>
                    <span className="text-xs opacity-80">Discover today's specials</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-border/50 hover:bg-accent/50 bg-transparent h-auto p-6"
                >
                  <Link href="/orders" className="flex flex-col items-center space-y-2">
                    <Clock className="w-6 h-6" />
                    <span className="font-medium">Track Orders</span>
                    <span className="text-xs opacity-80">Check order status</span>
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card className="gradient-card backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Your latest dining history</CardDescription>
              </CardHeader>
              <CardContent>
                {recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {recentOrders.slice(0, 3).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 rounded-lg gradient-accent">
                        <div>
                          <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
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
                    <Button asChild variant="outline" className="w-full border-border/50 bg-transparent">
                      <Link href="/orders">View All Orders</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No orders yet</p>
                    <Button asChild className="gradient-primary">
                      <Link href="/menu">Place Your First Order</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Loyalty Progress */}
          <div className="space-y-6">
            <Card className="gradient-card backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-chart-4" />
                  Loyalty Progress
                </CardTitle>
                <CardDescription>Earn points with every order</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Current Points</span>
                    <span className="font-medium">{loyaltyPoints}</span>
                  </div>
                  <Progress value={progressToNextTier} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {nextTierPoints - loyaltyPoints} points to next tier
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Bronze Tier</span>
                    <Badge variant={loyaltyPoints >= 0 ? "default" : "outline"}>
                      {loyaltyPoints >= 0 ? "Unlocked" : "Locked"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Silver Tier</span>
                    <Badge variant={loyaltyPoints >= 100 ? "default" : "outline"}>
                      {loyaltyPoints >= 100 ? "Unlocked" : "100 pts"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Gold Tier</span>
                    <Badge variant={loyaltyPoints >= 250 ? "default" : "outline"}>
                      {loyaltyPoints >= 250 ? "Unlocked" : "250 pts"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="gradient-card backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
                <CardDescription>Your dining milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userStats?.total_orders && userStats.total_orders >= 1 && (
                    <div className="flex items-center gap-3 p-3 rounded-lg gradient-accent">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                        <Star className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">First Order</p>
                        <p className="text-xs text-muted-foreground">Welcome to the canteen!</p>
                      </div>
                    </div>
                  )}
                  {userStats?.total_orders && userStats.total_orders >= 5 && (
                    <div className="flex items-center gap-3 p-3 rounded-lg gradient-accent">
                      <div className="w-8 h-8 bg-chart-2/20 rounded-full flex items-center justify-center">
                        <Trophy className="w-4 h-4 text-chart-2" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Regular Customer</p>
                        <p className="text-xs text-muted-foreground">5 orders completed</p>
                      </div>
                    </div>
                  )}
                  {userStats?.streak_days && userStats.streak_days >= 3 && (
                    <div className="flex items-center gap-3 p-3 rounded-lg gradient-accent">
                      <div className="w-8 h-8 bg-destructive/20 rounded-full flex items-center justify-center">
                        <Flame className="w-4 h-4 text-destructive" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">On Fire</p>
                        <p className="text-xs text-muted-foreground">3-day streak</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
