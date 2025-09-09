import { createClient } from "@/lib/supabase/server"
import { CarGrid } from "@/components/car-grid"
import { CarFilters } from "@/components/car-filters"
import { Header } from "@/components/header"
import { Car } from "lucide-react"

export default async function CarsPage({
  searchParams,
}: {
  searchParams: Promise<{
    location?: string
    minPrice?: string
    maxPrice?: string
    transmission?: string
    fuelType?: string
    seats?: string
  }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Build query based on filters
  let query = supabase.from("cars").select("*").eq("status", "available")

  if (params.location) {
    query = query.ilike("location", `%${params.location}%`)
  }
  if (params.minPrice) {
    query = query.gte("daily_rate", Number.parseFloat(params.minPrice))
  }
  if (params.maxPrice) {
    query = query.lte("daily_rate", Number.parseFloat(params.maxPrice))
  }
  if (params.transmission) {
    query = query.eq("transmission", params.transmission)
  }
  if (params.fuelType) {
    query = query.eq("fuel_type", params.fuelType)
  }
  if (params.seats) {
    query = query.eq("seats", Number.parseInt(params.seats))
  }

  const { data: cars, error } = await query.order("daily_rate", { ascending: true })

  if (error) {
    console.error("Error fetching cars:", error)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <Header showBackButton={true} backHref="/" backLabel="Back" />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Available Cars</h1>
          <p className="text-muted-foreground">{cars?.length || 0} cars available for rent across Ghana</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <CarFilters />
          </div>

          {/* Cars Grid */}
          <div className="lg:col-span-3">
            <CarGrid cars={cars || []} />
          </div>
        </div>
      </div>
    </div>
  )
}
