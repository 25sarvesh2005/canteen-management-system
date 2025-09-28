import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getProfile } from "@/lib/database"
import { AdminNav } from "@/components/admin-nav"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"

export default async function AdminAnalyticsPage() {
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

  // Fetch analytics data
  const [ordersData, menuItemsData, inventoryData, userStatsData] = await Promise.all([
    supabase.from("orders").select("*").order("created_at", { ascending: false }),
    supabase.from("menu_items").select(`
        *,
        order_items(quantity, total_price)
      `),
    supabase.from("inventory").select("*"),
    supabase.from("user_stats").select("*"),
  ])

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="container mx-auto max-w-7xl">
        <AdminNav profile={profile} />

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Insights and performance metrics for your canteen</p>
        </div>

        <AnalyticsDashboard
          orders={ordersData.data || []}
          menuItems={menuItemsData.data || []}
          inventory={inventoryData.data || []}
          userStats={userStatsData.data || []}
        />
      </div>
    </div>
  )
}
