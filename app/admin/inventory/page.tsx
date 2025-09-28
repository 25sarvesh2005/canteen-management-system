import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getProfile, getInventoryItems } from "@/lib/database"
import { AdminNav } from "@/components/admin-nav"
import { InventoryTable } from "@/components/inventory-table"

export default async function AdminInventoryPage() {
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

  const inventoryItems = await getInventoryItems()

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="container mx-auto max-w-7xl">
        <AdminNav profile={profile} />

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Inventory Management</h1>
          <p className="text-muted-foreground">Monitor stock levels and manage supplies</p>
        </div>

        <InventoryTable items={inventoryItems} />
      </div>
    </div>
  )
}
