import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getProfile, getUserStats, getUserOrders } from "@/lib/database"
import { StudentNav } from "@/components/student-nav"
import { StudentStatsView } from "@/components/student-stats-view"

export default async function StatsPage() {
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

  const [userStats, orders] = await Promise.all([getUserStats(user.id), getUserOrders(user.id)])

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="container mx-auto max-w-4xl">
        <StudentNav profile={profile} />

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Stats</h1>
          <p className="text-muted-foreground">Track your dining journey and achievements</p>
        </div>

        <StudentStatsView userStats={userStats} orders={orders} />
      </div>
    </div>
  )
}
