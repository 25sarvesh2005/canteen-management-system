import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getProfile, getAllOrders } from "@/lib/database"
import { AdminNav } from "@/components/admin-nav"
import { OrdersKanban } from "@/components/orders-kanban"

export default async function AdminOrdersPage() {
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

  const orders = await getAllOrders()

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="container mx-auto max-w-7xl">
        <AdminNav profile={profile} />

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Order Management</h1>
          <p className="text-muted-foreground">Manage orders with drag-and-drop Kanban board</p>
        </div>

        <OrdersKanban orders={orders} />
      </div>
    </div>
  )
}
