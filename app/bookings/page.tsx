import { createClient } from "@/lib/supabase/server"
import { BookingsList } from "@/components/bookings-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Car, ArrowLeft, Calendar } from "lucide-react"

export default async function BookingsPage() {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/auth/login")
  }

  // Get user's bookings
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(`
      *,
      cars (make, model, year, color, license_plate)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching bookings:", error)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                  <Car className="h-6 w-6" />
                </div>
                <h1 className="text-2xl font-bold text-primary">DV Rentals</h1>
              </div>
            </div>
            <Button asChild>
              <Link href="/cars">Browse Cars</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">My Bookings</h1>
          </div>
          <p className="text-muted-foreground">{bookings?.length || 0} bookings found</p>
        </div>

        <BookingsList bookings={bookings || []} />
      </div>
    </div>
  )
}
