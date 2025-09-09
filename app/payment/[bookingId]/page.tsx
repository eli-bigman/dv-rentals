import { createClient } from "@/lib/supabase/server"
import { PaymentForm } from "@/components/payment-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { redirect } from "next/navigation"
import { notFound } from "next/navigation"
import { Car, ArrowLeft, CreditCard, Shield, Clock } from "lucide-react"

export default async function PaymentPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/auth/login")
  }

  // Get booking details
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select(`
      *,
      cars (make, model, year, color, license_plate)
    `)
    .eq("id", bookingId)
    .eq("user_id", user.id)
    .single()

  if (bookingError || !booking) {
    notFound()
  }

  // Redirect if already paid
  if (booking.payment_status === "paid") {
    redirect(`/booking/confirmation/${bookingId}`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link href={`/booking/confirmation/${bookingId}`}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Booking
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                  <Car className="h-6 w-6" />
                </div>
                <h1 className="text-2xl font-bold text-primary">DV Rentals</h1>
              </div>
            </div>
            <Button asChild variant="ghost">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Complete Payment</h1>
            <p className="text-muted-foreground">Secure payment for your car rental booking</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Payment Form */}
            <div className="lg:col-span-2">
              <PaymentForm booking={booking} />
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Summary
                  </CardTitle>
                  <CardDescription>Booking ID: {booking.id.slice(0, 8)}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Car Details */}
                  <div>
                    <h3 className="font-semibold">
                      {booking.cars.year} {booking.cars.make} {booking.cars.model}
                    </h3>
                    <p className="text-sm text-muted-foreground">{booking.cars.color}</p>
                    <Badge variant="outline" className="mt-1">
                      {booking.cars.license_plate}
                    </Badge>
                  </div>

                  <Separator />

                  {/* Rental Period */}
                  <div>
                    <h4 className="font-medium mb-2">Rental Period</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                    </p>
                    <p className="text-sm text-muted-foreground">{booking.total_days} days total</p>
                  </div>

                  <Separator />

                  {/* Pricing Breakdown */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Rental ({booking.total_days} days)</span>
                      <span>GH₵ {booking.subtotal}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Insurance Fee</span>
                      <span>GH₵ {booking.insurance_fee}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>VAT (12.5%)</span>
                      <span>GH₵ {booking.tax_amount}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between font-semibold text-lg">
                      <span>Total Amount</span>
                      <span className="text-primary">GH₵ {booking.total_amount}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Security Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      <span>Secure payment processing</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Payment confirmation within 5 minutes</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
