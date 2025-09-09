"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { createBooking } from "@/lib/actions/booking"
import { Calendar, Clock, MapPin, CreditCard } from "lucide-react"

interface BookingFormProps {
  car: any
  user: any
  profile: any
}

export function BookingForm({ car, user, profile }: BookingFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    pickupLocation: car.location,
    dropoffLocation: car.location,
    pickupTime: "09:00",
    dropoffTime: "09:00",
    specialRequests: "",
  })

  const [pricing, setPricing] = useState({
    totalDays: 0,
    subtotal: 0,
    insuranceFee: 0,
    taxAmount: 0,
    totalAmount: 0,
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Calculate pricing when dates change
    if (field === "startDate" || field === "endDate") {
      calculatePricing({ ...formData, [field]: value })
    }
  }

  const calculatePricing = (data: typeof formData) => {
    if (!data.startDate || !data.endDate) {
      setPricing({ totalDays: 0, subtotal: 0, insuranceFee: 0, taxAmount: 0, totalAmount: 0 })
      return
    }

    const start = new Date(data.startDate)
    const end = new Date(data.endDate)
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

    if (totalDays <= 0) {
      setPricing({ totalDays: 0, subtotal: 0, insuranceFee: 0, taxAmount: 0, totalAmount: 0 })
      return
    }

    let dailyRate = car.daily_rate

    // Apply weekly/monthly discounts
    if (totalDays >= 30 && car.monthly_rate) {
      const months = Math.floor(totalDays / 30)
      const remainingDays = totalDays % 30
      dailyRate = (months * car.monthly_rate + remainingDays * car.daily_rate) / totalDays
    } else if (totalDays >= 7 && car.weekly_rate) {
      const weeks = Math.floor(totalDays / 7)
      const remainingDays = totalDays % 7
      dailyRate = (weeks * car.weekly_rate + remainingDays * car.daily_rate) / totalDays
    }

    const subtotal = totalDays * dailyRate
    const insuranceFee = subtotal * 0.1 // 10% insurance fee
    const taxAmount = (subtotal + insuranceFee) * 0.125 // 12.5% VAT
    const totalAmount = subtotal + insuranceFee + taxAmount

    setPricing({
      totalDays,
      subtotal: Math.round(subtotal * 100) / 100,
      insuranceFee: Math.round(insuranceFee * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (pricing.totalDays <= 0) {
      setError("Please select valid rental dates")
      setIsLoading(false)
      return
    }

    try {
      const bookingData = {
        carId: car.id,
        userId: user.id,
        startDate: formData.startDate,
        endDate: formData.endDate,
        pickupLocation: formData.pickupLocation,
        dropoffLocation: formData.dropoffLocation,
        pickupTime: formData.pickupTime,
        dropoffTime: formData.dropoffTime,
        totalDays: pricing.totalDays,
        dailyRate: car.daily_rate,
        subtotal: pricing.subtotal,
        insuranceFee: pricing.insuranceFee,
        taxAmount: pricing.taxAmount,
        totalAmount: pricing.totalAmount,
        specialRequests: formData.specialRequests,
      }

      const result = await createBooking(bookingData)

      if (result.success) {
        router.push(`/booking/confirmation/${result.bookingId}`)
      } else {
        setError(result.error || "Failed to create booking")
      }
    } catch (error) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const today = new Date().toISOString().split("T")[0]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Rental Dates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Rental Dates
          </CardTitle>
          <CardDescription>Select your pickup and return dates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Pickup Date</Label>
              <Input
                id="startDate"
                type="date"
                min={today}
                required
                value={formData.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Return Date</Label>
              <Input
                id="endDate"
                type="date"
                min={formData.startDate || today}
                required
                value={formData.endDate}
                onChange={(e) => handleInputChange("endDate", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pickup & Return Times */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pickup & Return Times
          </CardTitle>
          <CardDescription>Select your preferred times</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pickupTime">Pickup Time</Label>
              <Select value={formData.pickupTime} onValueChange={(value) => handleInputChange("pickupTime", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="08:00">8:00 AM</SelectItem>
                  <SelectItem value="09:00">9:00 AM</SelectItem>
                  <SelectItem value="10:00">10:00 AM</SelectItem>
                  <SelectItem value="11:00">11:00 AM</SelectItem>
                  <SelectItem value="12:00">12:00 PM</SelectItem>
                  <SelectItem value="13:00">1:00 PM</SelectItem>
                  <SelectItem value="14:00">2:00 PM</SelectItem>
                  <SelectItem value="15:00">3:00 PM</SelectItem>
                  <SelectItem value="16:00">4:00 PM</SelectItem>
                  <SelectItem value="17:00">5:00 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dropoffTime">Return Time</Label>
              <Select value={formData.dropoffTime} onValueChange={(value) => handleInputChange("dropoffTime", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="08:00">8:00 AM</SelectItem>
                  <SelectItem value="09:00">9:00 AM</SelectItem>
                  <SelectItem value="10:00">10:00 AM</SelectItem>
                  <SelectItem value="11:00">11:00 AM</SelectItem>
                  <SelectItem value="12:00">12:00 PM</SelectItem>
                  <SelectItem value="13:00">1:00 PM</SelectItem>
                  <SelectItem value="14:00">2:00 PM</SelectItem>
                  <SelectItem value="15:00">3:00 PM</SelectItem>
                  <SelectItem value="16:00">4:00 PM</SelectItem>
                  <SelectItem value="17:00">5:00 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Locations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Pickup & Return Locations
          </CardTitle>
          <CardDescription>Choose your pickup and return locations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pickupLocation">Pickup Location</Label>
              <Select
                value={formData.pickupLocation}
                onValueChange={(value) => handleInputChange("pickupLocation", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Accra">Accra - Main Office</SelectItem>
                  <SelectItem value="Accra Airport">Accra - Kotoka Airport</SelectItem>
                  <SelectItem value="Kumasi">Kumasi - Main Office</SelectItem>
                  <SelectItem value="Kumasi Airport">Kumasi - Airport</SelectItem>
                  <SelectItem value="Tamale">Tamale - Main Office</SelectItem>
                  <SelectItem value="Cape Coast">Cape Coast - Main Office</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dropoffLocation">Return Location</Label>
              <Select
                value={formData.dropoffLocation}
                onValueChange={(value) => handleInputChange("dropoffLocation", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Accra">Accra - Main Office</SelectItem>
                  <SelectItem value="Accra Airport">Accra - Kotoka Airport</SelectItem>
                  <SelectItem value="Kumasi">Kumasi - Main Office</SelectItem>
                  <SelectItem value="Kumasi Airport">Kumasi - Airport</SelectItem>
                  <SelectItem value="Tamale">Tamale - Main Office</SelectItem>
                  <SelectItem value="Cape Coast">Cape Coast - Main Office</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Special Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Special Requests</CardTitle>
          <CardDescription>Any additional requirements or requests (optional)</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="e.g., Child seat, GPS navigation, specific pickup instructions..."
            value={formData.specialRequests}
            onChange={(e) => handleInputChange("specialRequests", e.target.value)}
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Pricing Summary */}
      {pricing.totalDays > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Pricing Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span>
                Rental ({pricing.totalDays} days × GH₵ {car.daily_rate})
              </span>
              <span>GH₵ {pricing.subtotal}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Insurance Fee (10%)</span>
              <span>GH₵ {pricing.insuranceFee}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>VAT (12.5%)</span>
              <span>GH₵ {pricing.taxAmount}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between font-semibold text-lg">
              <span>Total Amount</span>
              <span className="text-primary">GH₵ {pricing.totalAmount}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={isLoading || pricing.totalDays <= 0}>
        {isLoading ? "Creating Booking..." : `Proceed to Payment - GH₵ ${pricing.totalAmount}`}
      </Button>
    </form>
  )
}
