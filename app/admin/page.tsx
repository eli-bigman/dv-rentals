import { createClient } from "@/lib/supabase/server"
import { RecentBookings } from "@/components/admin/recent-bookings"
import { FleetOverview } from "@/components/admin/fleet-overview"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Car, Users, Calendar, CreditCard, BarChart3 } from "lucide-react"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Check if user is authenticated and is admin
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/auth/login")
  }

  // Check if user has admin role
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()
  if (!profile || !["admin", "staff"].includes(profile.role)) {
    redirect("/dashboard")
  }

  // Get dashboard statistics
  const [{ count: totalCars }, { count: totalUsers }, { count: totalBookings }, { count: activeBookings }] =
    await Promise.all([
      supabase.from("cars").select("*", { count: "exact", head: true }),
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase.from("bookings").select("*", { count: "exact", head: true }),
      supabase.from("bookings").select("*", { count: "exact", head: true }).in("status", ["confirmed", "active"]),
    ])

  // Get recent bookings
  const { data: recentBookings } = await supabase
    .from("bookings")
    .select(`
      *,
      users (full_name, phone_number),
      cars (make, model, year, license_plate)
    `)
    .order("created_at", { ascending: false })
    .limit(5)

  // Get fleet overview
  const { data: fleetData } = await supabase.from("cars").select("status")

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                <Car className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary">DV Rentals</h1>
                <p className="text-sm text-muted-foreground">Admin Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost">
                <Link href="/">Public Site</Link>
              </Button>
              <Button asChild variant="outline" className="bg-transparent">
                <Link href="/dashboard">User Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your car rental business</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Button asChild className="h-auto p-4 flex-col gap-2">
            <Link href="/admin/cars">
              <Car className="h-6 w-6" />
              <span>Manage Cars</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2 bg-transparent">
            <Link href="/admin/bookings">
              <Calendar className="h-6 w-6" />
              <span>View Bookings</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2 bg-transparent">
            <Link href="/admin/users">
              <Users className="h-6 w-6" />
              <span>Manage Users</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2 bg-transparent">
            <Link href="/admin/payments">
              <CreditCard className="h-6 w-6" />
              <span>View Payments</span>
            </Link>
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cars</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCars || 0}</div>
              <p className="text-xs text-muted-foreground">Fleet vehicles</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">Registered customers</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBookings || 0}</div>
              <p className="text-xs text-muted-foreground">All time bookings</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Rentals</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeBookings || 0}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Bookings */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Latest rental bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentBookings bookings={recentBookings || []} />
            </CardContent>
          </Card>

          {/* Fleet Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Fleet Overview</CardTitle>
              <CardDescription>Vehicle availability status</CardDescription>
            </CardHeader>
            <CardContent>
              <FleetOverview fleetData={fleetData || []} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
