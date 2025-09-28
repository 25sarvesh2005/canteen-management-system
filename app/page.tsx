import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Utensils, Users, TrendingUp, Clock } from "lucide-react"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    // Get user profile to determine redirect
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role === "admin") {
      redirect("/admin")
    } else {
      redirect("/dashboard")
    }
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent mb-6 text-balance">
            Campus Canteen
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            Experience the future of campus dining with our smart ordering system. Fresh meals, quick service, and
            seamless digital experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="gradient-primary hover:opacity-90 transition-opacity">
              <Link href="/auth/signup">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-border/50 hover:bg-accent/50 bg-transparent">
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="gradient-card backdrop-blur-sm border-border/50">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <Utensils className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Fresh Meals</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Delicious, freshly prepared meals made with quality ingredients daily.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="gradient-card backdrop-blur-sm border-border/50">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-chart-2/20 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-chart-2" />
              </div>
              <CardTitle className="text-lg">Quick Service</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Pre-order your meals and skip the queue with our smart ordering system.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="gradient-card backdrop-blur-sm border-border/50">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-chart-3/20 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-chart-3" />
              </div>
              <CardTitle className="text-lg">Community</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Connect with fellow students and discover popular menu items.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="gradient-card backdrop-blur-sm border-border/50">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-chart-4/20 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-chart-4" />
              </div>
              <CardTitle className="text-lg">Smart Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Track your dining habits and earn rewards with our gamified system.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="gradient-card backdrop-blur-sm border-border/50 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-balance">Ready to Transform Your Dining Experience?</CardTitle>
              <CardDescription>
                Join thousands of students who have already upgraded their campus dining experience.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="lg" className="gradient-primary hover:opacity-90 transition-opacity">
                <Link href="/auth/signup">Create Your Account</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
