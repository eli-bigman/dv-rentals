import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Header } from "@/components/header"
import { Car, MapPin, Fuel, Users, Settings, Shield, Calendar, Star, CheckCircle } from "lucide-react"

export default async function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: car, error } = await supabase.from("cars").select("*").eq("id", id).single()

  if (error || !car) {
    notFound()
  }

  // Get reviews for this car
  const { data: reviews } = await supabase
    .from("reviews")
    .select(`
      *,
      users (full_name)
    `)
    .eq("car_id", id)
    .order("created_at", { ascending: false })
    .limit(5)

  const averageRating = reviews?.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <Header showBackButton={true} backHref="/cars" backLabel="Back to Cars" />

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Car Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Car Images */}
            <Card>
              <CardContent className="p-0">
                {car.image_url && car.image_url.length > 0 ? (
                  <div className="relative">
                    <div className="aspect-video relative overflow-hidden rounded-t-lg">
                      <Image
                        src={car.image_url[0]}
                        alt={`${car.make} ${car.model}`}
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>
                    
                    {car.image_url.length > 1 && (
                      <div className="grid grid-cols-4 gap-2 p-2 bg-muted/20">
                        {car.image_url.slice(1, 5).map((img: string, index: number) => (
                          <div key={index} className="aspect-video relative overflow-hidden rounded">
                            <Image
                              src={img}
                              alt={`${car.make} ${car.model} - view ${index + 2}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                        {car.image_url.length > 5 && (
                          <div className="absolute bottom-4 right-4">
                            <Badge variant="secondary">
                              +{car.image_url.length - 5} more
                            </Badge>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-t-lg flex items-center justify-center">
                    <Car className="h-24 w-24 text-muted-foreground" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Car Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">
                      {car.year} {car.make} {car.model}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <MapPin className="h-4 w-4" />
                      {car.location}
                    </CardDescription>
                  </div>
                  <Badge variant={car.status === "available" ? "default" : "secondary"} className="capitalize">
                    {car.status}
                  </Badge>
                </div>
                {reviews && reviews.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(averageRating) ? "fill-primary text-primary" : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {averageRating.toFixed(1)} ({reviews.length} reviews)
                    </span>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">{car.description}</p>

                {/* Car Specs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Fuel className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm capitalize">{car.fuel_type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm capitalize">{car.transmission}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{car.seats} seats</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Insured</span>
                  </div>
                </div>

                {/* Features */}
                {car.features && car.features.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Features</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {car.features.map((feature: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-secondary" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reviews */}
            {reviews && reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Customer Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reviews.map((review: any) => (
                      <div key={review.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{review.users?.full_name || "Anonymous"}</span>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? "fill-primary text-primary" : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && <p className="text-muted-foreground text-sm">{review.comment}</p>}
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Rental Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Daily Rate</span>
                    <span className="text-2xl font-bold text-primary">GH₵ {car.daily_rate}</span>
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

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>Comprehensive insurance included</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Flexible booking dates</span>
                  </div>
                </div>

                <Button asChild className="w-full" size="lg" disabled={car.status !== "available"}>
                  <Link href={`/booking/${car.id}`}>{car.status === "available" ? "Book Now" : "Not Available"}</Link>
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Free cancellation up to 24 hours before pickup
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
