import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { Car, MapPin, Fuel, Users, Settings } from "lucide-react"

interface CarGridProps {
  cars: Array<{
    id: string
    make: string
    model: string
    year: number
    color: string
    fuel_type: string
    transmission: string
    seats: number
    daily_rate: number
    location: string
    status: string
    features?: string[]
    image_url?: string[]
  }>
}

export function CarGrid({ cars }: CarGridProps) {
  if (!cars || cars.length === 0) {
    return (
      <div className="text-center py-12">
        <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No cars found</h3>
        <p className="text-muted-foreground">Try adjusting your filters to see more results.</p>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
      {cars.map((car) => (
        <Card key={car.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center relative overflow-hidden">
            {car.image_url && car.image_url.length > 0 ? (
              <Image
                src={car.image_url[0]}
                alt={`${car.make} ${car.model}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover hover:scale-105 transition-transform"
                priority={false}
              />
            ) : (
              <Car className="h-12 w-12 text-muted-foreground" />
            )}
          </div>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-lg">
                {car.year} {car.make} {car.model}
              </h3>
              <Badge variant={car.status === "available" ? "default" : "secondary"} className="capitalize">
                {car.status}
              </Badge>
            </div>

            <div className="flex items-center gap-1 text-muted-foreground text-sm mb-4">
              <MapPin className="h-4 w-4" />
              <span>{car.location}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
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

            {car.features && car.features.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {car.features.slice(0, 3).map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {car.features.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{car.features.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold text-primary">GH₵ {car.daily_rate}</span>
                <span className="text-muted-foreground text-sm">/day</span>
              </div>
              <Button asChild size="sm" disabled={car.status !== "available"}>
                <Link href={`/cars/${car.id}`}>{car.status === "available" ? "View Details" : "Unavailable"}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
