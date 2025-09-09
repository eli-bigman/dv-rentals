import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ContractViewer } from "@/components/contract-viewer"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function ContractPage({ params }: { params: { bookingId: string } }) {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get booking details with car and user info
  const { data: booking } = await supabase
    .from("bookings")
    .select(`
      *,
      cars (*),
      users (*)
    `)
    .eq("id", params.bookingId)
    .eq("user_id", user.id)
    .single()

  if (!booking) {
    redirect("/bookings")
  }

  // Get existing contract if any
  const { data: contract } = await supabase.from("contracts").select("*").eq("booking_id", params.bookingId).single()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Rental Agreement</h1>
              <p className="text-muted-foreground mt-2">
                Contract for {booking.cars.make} {booking.cars.model} - Booking #{booking.id.slice(0, 8)}
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/bookings">Back to Bookings</Link>
            </Button>
          </div>

          <ContractViewer booking={booking} contract={contract} />
        </div>
      </div>
    </div>
  )
}
