import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { redirect } from "next/navigation"
import { notFound } from "next/navigation"
import { Car, Calendar, MapPin, CreditCard, CheckCircle, ArrowRight } from "lucide-react"

export default async function BookingConfirmationPage({ params }: { params: Promise<{ bookingId: string }> }) {
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
      cars (*)
    `)
    .eq("id", bookingId)
    .eq("user_id", user.id)
    .single()

  if (bookingError || !booking) {
    notFound()
  }

  // Get contract for this booking
  const { data: contract } = await supabase
    .from("contracts")
    .select("*")
    .eq("booking_id", bookingId)
    .single()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

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
              <h1 className="text-2xl font-bold text-primary">DV Rentals</h1>
            </div>
            <Button asChild variant="ghost">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 bg-secondary/10 text-secondary p-4 rounded-full w-fit">
              <CheckCircle className="h-12 w-12" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
            <p className="text-muted-foreground text-lg">
              Your rental has been successfully booked. Booking ID:{" "}
              <span className="font-mono">{booking.id.slice(0, 8)}</span>
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Booking Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Car Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    Vehicle Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <div className="aspect-video w-32 bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Car className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {booking.cars.year} {booking.cars.make} {booking.cars.model}
                      </h3>
                      <p className="text-muted-foreground">{booking.cars.color}</p>
                      <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                        <MapPin className="h-4 w-4" />
                        <span>{booking.cars.location}</span>
                      </div>
                      <Badge variant="outline" className="mt-2">
                        License: {booking.cars.license_plate}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rental Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Rental Period
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Pickup</h4>
                      <p className="text-sm text-muted-foreground">{formatDate(booking.start_date)}</p>
                      <p className="text-sm text-muted-foreground">{formatTime(booking.pickup_time)}</p>
                      <p className="text-sm text-muted-foreground">{booking.pickup_location}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Return</h4>
                      <p className="text-sm text-muted-foreground">{formatDate(booking.end_date)}</p>
                      <p className="text-sm text-muted-foreground">{formatTime(booking.dropoff_time)}</p>
                      <p className="text-sm text-muted-foreground">{booking.dropoff_location}</p>
                    </div>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm">
                      <strong>Total Duration:</strong> {booking.total_days} days
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Special Requests */}
              {booking.special_requests && (
                <Card>
                  <CardHeader>
                    <CardTitle>Special Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{booking.special_requests}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Payment Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Summary
                  </CardTitle>
                  <CardDescription>
                    Status:{" "}
                    <Badge variant={booking.payment_status === "paid" ? "default" : "secondary"} className="capitalize">
                      {booking.payment_status}
                    </Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Rental ({booking.total_days} days)</span>
                    <span>GH₵ {booking.subtotal}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Insurance Fee</span>
                    <span>GH₵ {booking.insurance_fee}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>VAT</span>
                    <span>GH₵ {booking.tax_amount}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between font-semibold text-lg">
                    <span>Total Paid</span>
                    <span className="text-primary">GH₵ {booking.total_amount}</span>
                  </div>


                  {/* Enforce contract signing before payment */}
                  {booking.payment_status === "pending" && (
                    contract && contract.status === "signed" ? (
                      <Button asChild className="w-full" size="lg">
                        <Link href={`/payment/${booking.id}`}>
                          Complete Payment
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild className="w-full" size="lg" variant="secondary">
                        <Link href={`/contracts/${booking.id}`}>
                          Sign Rental Agreement
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    )
                  )}

                  <div className="space-y-2 pt-4">
                    <Button asChild variant="outline" className="w-full bg-transparent">
                      <Link href="/bookings">View All Bookings</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full bg-transparent">
                      <Link href="/dashboard">Back to Dashboard</Link>
                    </Button>
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
