import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getProfile, getMenuItems, getCategories } from "@/lib/database"
import { StudentNav } from "@/components/student-nav"
import { MenuGrid } from "@/components/menu-grid"

export default async function MenuPage() {
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

  const [menuItems, categories] = await Promise.all([getMenuItems(), getCategories()])

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="container mx-auto max-w-7xl">
        <StudentNav profile={profile} />

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Menu</h1>
          <p className="text-muted-foreground">Discover delicious meals made fresh daily</p>
        </div>

        <MenuGrid menuItems={menuItems} categories={categories} />
      </div>
    </div>
  )
}
