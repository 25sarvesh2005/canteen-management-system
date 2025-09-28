import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getProfile, getUserOrders } from "@/lib/database"
import { StudentNav } from "@/components/student-nav"
import { OrdersList } from "@/components/orders-list"

export default async function OrdersPage() {
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

  const orders = await getUserOrders(user.id)

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="container mx-auto max-w-4xl">
        <StudentNav profile={profile} />

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Orders</h1>
          <p className="text-muted-foreground">Track your current and past orders</p>
        </div>

        <OrdersList orders={orders} />
      </div>
    </div>
  )
}
