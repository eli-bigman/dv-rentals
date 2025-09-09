import { createClient } from "@/lib/supabase/server"
import { BookingForm } from "@/components/booking-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { redirect } from "next/navigation"
import { notFound } from "next/navigation"
import { Car, ArrowLeft, MapPin, Fuel, Users, Settings } from "lucide-react"

export default async function BookingPage({ params }: { params: Promise<{ carId: string }> }) {
  const { carId } = await params
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/auth/login")
  }

  // Get car details
  const { data: car, error: carError } = await supabase.from("cars").select("*").eq("id", carId).single()

  if (carError || !car) {
    notFound()
  }

  if (car.status !== "available") {
    redirect(`/cars/${carId}`)
  }

  // Get user profile
  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link href={`/cars/${carId}`}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Car
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Book Your Rental</h1>
          <p className="text-muted-foreground">Complete your booking details below</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <BookingForm car={car} user={user} profile={profile} />
          </div>

          {/* Car Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Car Image */}
                <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center">
                  <Car className="h-12 w-12 text-muted-foreground" />
                </div>

                {/* Car Details */}
                <div>
                  <h3 className="font-semibold text-lg">
                    {car.year} {car.make} {car.model}
                  </h3>
                  <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                    <MapPin className="h-4 w-4" />
                    <span>{car.location}</span>
                  </div>
                </div>

                {/* Car Specs */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Fuel className="h-3 w-3 text-muted-foreground" />
                    <span className="capitalize">{car.fuel_type}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Settings className="h-3 w-3 text-muted-foreground" />
                    <span className="capitalize">{car.transmission}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span>{car.seats} seats</span>
                  </div>
                </div>

                {/* Pricing */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span>Daily Rate</span>
                    <span className="font-semibold">GH₵ {car.daily_rate}</span>
                  </div>
                  {car.weekly_rate && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Weekly Rate</span>
                      <span>GH₵ {car.weekly_rate}</span>
                    </div>
                  )}
                  {car.monthly_rate && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Monthly Rate</span>
                      <span>GH₵ {car.monthly_rate}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
