import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Car, User, Calendar, CreditCard } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("users").select("*").eq("id", data.user.id).single()
  
  // Check if user is an admin
  const isAdmin = profile?.role === 'admin' || profile?.role === 'staff'

  // Get user's recent bookings
  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      *,
      cars (make, model, year, color)
    `)
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false })
    .limit(3)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
              <Car className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-primary">DV Rentals</h1>
          </div>
          <h2 className="text-3xl font-bold">Welcome back, {profile?.full_name || data.user.email}!</h2>
          <p className="text-muted-foreground">Manage your car rentals and account</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {isAdmin && (
            <Card className="border-primary/50 bg-gradient-to-br from-background to-primary/5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Admin Dashboard</CardTitle>
                <div className="bg-primary/20 p-1 rounded-full">
                  <User className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full bg-primary hover:bg-primary/90">
                  <Link href="/admin">Admin Panel</Link>
                </Button>
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Browse Cars</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/cars">Find Your Car</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Profile</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/profile">Update Profile</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/bookings">View Bookings</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payments</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/payments">Payment History</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {bookings && bookings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Your latest car rental activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bookings.map((booking: any) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {booking.cars.year} {booking.cars.make} {booking.cars.model}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(booking.start_date).toLocaleDateString()} -{" "}
                        {new Date(booking.end_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">GH₵ {booking.total_amount}</p>
                      <p className="text-sm text-muted-foreground capitalize">{booking.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
