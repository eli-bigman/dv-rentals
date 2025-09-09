import { createClient } from "@/lib/supabase/server"
import { PaymentHistory } from "@/components/payment-history"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Car, ArrowLeft, CreditCard } from "lucide-react"

export default async function PaymentsPage() {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/auth/login")
  }

  // Get user's payment history
  const { data: payments, error } = await supabase
    .from("payments")
    .select(`
      *,
      bookings (
        *,
        cars (make, model, year, license_plate)
      )
    `)
    .eq("bookings.user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching payments:", error)
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
            <CreditCard className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Payment History</h1>
          </div>
          <p className="text-muted-foreground">{payments?.length || 0} transactions found</p>
        </div>

        <PaymentHistory payments={payments || []} />
      </div>
    </div>
  )
}
