"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import Image from "next/image"
import { Car, Edit, Trash2, Search, Filter, MapPin, Fuel, Users, Settings } from "lucide-react"

interface CarManagementProps {
  cars: Array<{
    id: string
    make: string
    model: string
    year: number
    color: string
    license_plate: string
    fuel_type: string
    transmission: string
    seats: number
    daily_rate: number
    location: string
    status: string
    mileage: number
    features?: string[]
    description?: string
    image_url?: string[]
  }>
}

export function CarManagement({ cars }: CarManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("all")

  const filteredCars = cars.filter((car) => {
    const matchesSearch =
      car.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.license_plate.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || car.status === statusFilter
    const matchesLocation = locationFilter === "all" || car.location === locationFilter

    return matchesSearch && matchesStatus && matchesLocation
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "default"
      case "rented":
        return "secondary"
      case "maintenance":
        return "outline"
      case "retired":
        return "destructive"
      default:
        return "outline"
    }
  }

  const uniqueLocations = [...new Set(cars.map((car) => car.location))]

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search cars..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="rented">Rented</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {uniqueLocations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cars Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCars.map((car) => (
          <Card key={car.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {car.year} {car.make} {car.model}
                  </CardTitle>
                  <CardDescription>
                    {car.color} • {car.license_plate}
                  </CardDescription>
                </div>
                <Badge variant={getStatusColor(car.status)} className="capitalize">
                  {car.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center overflow-hidden relative">
                {car.image_url && car.image_url.length > 0 ? (
                  <Image
                    src={car.image_url[0]} 
                    alt={`${car.make} ${car.model}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <Car className="h-12 w-12 text-muted-foreground" />
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span>{car.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Fuel className="h-3 w-3 text-muted-foreground" />
                  <span className="capitalize">{car.fuel_type}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <span>{car.seats} seats</span>
                </div>
                <div className="flex items-center gap-1">
                  <Settings className="h-3 w-3 text-muted-foreground" />
                  <span className="capitalize">{car.transmission}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-lg font-bold text-primary">GH₵ {car.daily_rate}</span>
                  <span className="text-muted-foreground text-sm">/day</span>
                </div>
                <div className="text-sm text-muted-foreground">{car.mileage?.toLocaleString()} km</div>
              </div>

              <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Link href={`/admin/cars/${car.id}`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                </Button>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCars.length === 0 && (
        <div className="text-center py-12">
          <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No cars found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or add a new car to your fleet.</p>
        </div>
      )}
    </div>
  )
}
