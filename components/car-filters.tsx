"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Filter, X } from "lucide-react"

export function CarFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [filters, setFilters] = useState({
    location: searchParams.get("location") || "Any location",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    transmission: searchParams.get("transmission") || "Any transmission",
    fuelType: searchParams.get("fuelType") || "Any fuel type",
    seats: searchParams.get("seats") || "Any seats",
  })

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (
        value !== "Any location" &&
        value !== "Any transmission" &&
        value !== "Any fuel type" &&
        value !== "Any seats"
      )
        params.set(key, value)
    })
    router.push(`/cars?${params.toString()}`)
  }

  const clearFilters = () => {
    setFilters({
      location: "Any location",
      minPrice: "",
      maxPrice: "",
      transmission: "Any transmission",
      fuelType: "Any fuel type",
      seats: "Any seats",
    })
    router.push("/cars")
  }

  const hasActiveFilters = Object.values(filters).some(
    (value) =>
      value !== "" &&
      value !== "Any location" &&
      value !== "Any transmission" &&
      value !== "Any fuel type" &&
      value !== "Any seats",
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Select value={filters.location} onValueChange={(value) => handleFilterChange("location", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Any location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Any location">Any location</SelectItem>
              <SelectItem value="Accra">Accra</SelectItem>
              <SelectItem value="Kumasi">Kumasi</SelectItem>
              <SelectItem value="Tamale">Tamale</SelectItem>
              <SelectItem value="Cape Coast">Cape Coast</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Price Range (GH₵/day)</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Min"
              type="number"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange("minPrice", e.target.value)}
            />
            <Input
              placeholder="Max"
              type="number"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="transmission">Transmission</Label>
          <Select value={filters.transmission} onValueChange={(value) => handleFilterChange("transmission", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Any transmission" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Any transmission">Any transmission</SelectItem>
              <SelectItem value="automatic">Automatic</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fuelType">Fuel Type</Label>
          <Select value={filters.fuelType} onValueChange={(value) => handleFilterChange("fuelType", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Any fuel type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Any fuel type">Any fuel type</SelectItem>
              <SelectItem value="petrol">Petrol</SelectItem>
              <SelectItem value="diesel">Diesel</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
              <SelectItem value="electric">Electric</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="seats">Number of Seats</Label>
          <Select value={filters.seats} onValueChange={(value) => handleFilterChange("seats", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Any seats" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Any seats">Any seats</SelectItem>
              <SelectItem value="2">2 seats</SelectItem>
              <SelectItem value="4">4 seats</SelectItem>
              <SelectItem value="5">5 seats</SelectItem>
              <SelectItem value="7">7 seats</SelectItem>
              <SelectItem value="8">8+ seats</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 pt-4">
          <Button onClick={applyFilters} className="w-full">
            Apply Filters
          </Button>
          {hasActiveFilters && (
            <Button onClick={clearFilters} variant="outline" className="w-full bg-transparent">
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
