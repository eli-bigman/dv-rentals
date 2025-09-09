import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/header"
import { createClient } from "@/lib/supabase/server"
import { Car, MapPin, Shield, Clock, ArrowRight } from "lucide-react"

export default async function HomePage() {
  const supabase = await createClient()
  
  // Fetch popular cars - get the 3 most expensive available cars for featured display
  const { data: popularCars, error } = await supabase
    .from('cars')
    .select('*')
    .eq('status', 'available')
    .order('daily_rate', { ascending: false })
    .limit(3)
    
  if (error) {
    console.error("Error fetching popular cars:", error)
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <Header showBackButton={false} />

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-balance mb-6">
              Ghana's Most Trusted <span className="text-primary">Car Rental</span> Service
            </h1>
            <p className="text-xl text-muted-foreground text-balance mb-8">
              Explore Ghana with confidence. From Accra to Kumasi, we provide reliable, affordable car rentals for every
              journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="/cars">
                  Browse Cars <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 bg-transparent">
                <Link href="/auth/sign-up">Create Account</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose DV Rentals?</h2>
            <p className="text-muted-foreground text-lg">Experience the best car rental service in Ghana</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 bg-primary/10 text-primary p-3 rounded-full w-fit">
                  <MapPin className="h-8 w-8" />
                </div>
                <CardTitle>Multiple Locations</CardTitle>
                <CardDescription>Available in Accra, Kumasi, and major cities across Ghana</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 bg-secondary/10 text-secondary p-3 rounded-full w-fit">
                  <Shield className="h-8 w-8" />
                </div>
                <CardTitle>Fully Insured</CardTitle>
                <CardDescription>All vehicles come with comprehensive insurance coverage</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 bg-accent/10 text-accent p-3 rounded-full w-fit">
                  <Clock className="h-8 w-8" />
                </div>
                <CardTitle>24/7 Support</CardTitle>
                <CardDescription>Round-the-clock customer support for your peace of mind</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Cars Preview */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Popular Rental Cars</h2>
            <p className="text-muted-foreground text-lg">Choose from our fleet of well-maintained vehicles</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {popularCars && popularCars.length > 0 ? (
              popularCars.map((car) => (
                <Card key={car.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <Link href={`/cars/${car.id}`} className="block">
                    <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center relative overflow-hidden">
                      {car.image_url && car.image_url.length > 0 ? (
                        <Image
                          src={car.image_url[0]}
                          alt={`${car.make} ${car.model}`}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover hover:scale-105 transition-transform duration-300"
                          priority={false}
                        />
                      ) : (
                        <Car className="h-12 w-12 text-muted-foreground" />
                      )}
                    </div>
                  </Link>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{car.year} {car.make} {car.model}</h3>
                      <Badge variant="secondary" className="capitalize">
                        {car.daily_rate >= 200 ? "Premium" : car.daily_rate >= 150 ? "Popular" : "Economy"}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm mb-4">
                      {car.description?.substring(0, 60) || `${car.color} ${car.transmission} with ${car.seats} seats`}...
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-primary">GH₵ {car.daily_rate}</span>
                        <span className="text-muted-foreground">/day</span>
                      </div>
                      <Button asChild size="sm">
                        <Link href={`/cars/${car.id}`}>Details</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              // Fallback cards if no data is available
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-t-lg flex items-center justify-center">
                    <Car className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-5 w-32 bg-muted rounded animate-pulse"></div>
                      <Badge variant="secondary" className="opacity-50">Popular</Badge>
                    </div>
                    <div className="h-4 w-full bg-muted rounded animate-pulse mb-4"></div>
                    <div className="flex items-center justify-between">
                      <div className="h-6 w-20 bg-muted rounded animate-pulse"></div>
                      <Button disabled size="sm">Details</Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          <div className="text-center">
            <Button asChild size="lg">
              <Link href="/cars">View All Cars</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                  <Car className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-primary">DV Rentals</h3>
              </div>
              <p className="text-muted-foreground">Ghana's trusted car rental service since 2020.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>Car Rentals</li>
                <li>Long-term Leasing</li>
                <li>Corporate Packages</li>
                <li>Airport Transfers</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Locations</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>Accra</li>
                <li>Kumasi</li>
                <li>Tamale</li>
                <li>Cape Coast</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>+233 XX XXX XXXX</li>
                <li>info@dvrentals.gh</li>
                <li>24/7 Support</li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 DV Rentals. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
