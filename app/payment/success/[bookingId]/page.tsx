import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { redirect } from "next/navigation"
import { notFound } from "next/navigation"
import { Car, CheckCircle, Calendar, MapPin, CreditCard, Download, ArrowRight } from "lucide-react"

export default async function PaymentSuccessPage({ params }: { params: Promise<{ bookingId: string }> }) {
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

  // Get booking and payment details
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

  // Get payment details
  const { data: payment } = await supabase
    .from("payments")
    .select("*")
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: false })
    .limit(1)
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
            <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-muted-foreground text-lg">Your car rental has been confirmed and paid for</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Booking & Payment Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Payment Confirmation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Confirmation
                  </CardTitle>
                  <CardDescription>Transaction completed successfully</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Transaction ID</p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {payment?.transaction_reference || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Payment Method</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {payment?.payment_method?.replace("_", " ") || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Amount Paid</p>
                      <p className="text-sm text-muted-foreground">GH₵ {booking.total_amount}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Payment Date</p>
                      <p className="text-sm text-muted-foreground">
                        {payment?.payment_date ? new Date(payment.payment_date).toLocaleDateString("en-GB") : "N/A"}
                      </p>
                    </div>
                  </div>
                  {payment?.payment_provider && (
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-sm">
                        <strong>Provider:</strong> {payment.payment_provider}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

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
                    Rental Information
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
                </CardContent>
              </Card>
            </div>

            {/* Next Steps */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>What's Next?</CardTitle>
                  <CardDescription>Important information for your rental</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 text-primary p-1 rounded-full">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Booking Confirmed</p>
                        <p className="text-xs text-muted-foreground">Your rental is secured</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-muted text-muted-foreground p-1 rounded-full">
                        <Download className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Contract Preparation</p>
                        <p className="text-xs text-muted-foreground">We'll prepare your rental agreement</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-muted text-muted-foreground p-1 rounded-full">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Pickup Reminder</p>
                        <p className="text-xs text-muted-foreground">We'll send you a reminder 24 hours before</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Button asChild className="w-full">
                      <Link href="/bookings">
                        View All Bookings
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full bg-transparent">
                      <Link href="/cars">Browse More Cars</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full bg-transparent">
                      <Link href="/dashboard">Back to Dashboard</Link>
                    </Button>
                  </div>

                  <Separator />

                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                      Need help? Contact our support team at <span className="font-medium">+233 XX XXX XXXX</span>
                    </p>
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
