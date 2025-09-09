"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cancelBooking } from "@/lib/actions/booking"
import Link from "next/link"
import { Car, Calendar, MapPin, CreditCard, X, Eye } from "lucide-react"

interface BookingsListProps {
  bookings: Array<{
    id: string
    start_date: string
    end_date: string
    pickup_location: string
    dropoff_location: string
    total_amount: number
    status: string
    payment_status: string
    created_at: string
    cars: {
      make: string
      model: string
      year: number
      color: string
      license_plate: string
    }
  }>
}

export function BookingsList({ bookings }: BookingsListProps) {
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const handleCancelBooking = async (bookingId: string) => {
    setCancellingId(bookingId)
    try {
      const result = await cancelBooking(bookingId)
      if (!result.success) {
        alert(result.error || "Failed to cancel booking")
      }
    } catch (error) {
      alert("An error occurred while cancelling the booking")
    } finally {
      setCancellingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default"
      case "active":
        return "default"
      case "completed":
        return "secondary"
      case "cancelled":
        return "destructive"
      default:
        return "outline"
    }
  }

  const canCancelBooking = (booking: any) => {
    const startDate = new Date(booking.start_date)
    const now = new Date()
    const hoursUntilStart = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    return booking.status === "pending" || (booking.status === "confirmed" && hoursUntilStart > 24)
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
        <p className="text-muted-foreground mb-6">You haven't made any car rental bookings yet.</p>
        <Button asChild>
          <Link href="/cars">Browse Available Cars</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {bookings.map((booking) => (
        <Card key={booking.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  {booking.cars.year} {booking.cars.make} {booking.cars.model}
                </CardTitle>
                <CardDescription>
                  Booking ID: {booking.id.slice(0, 8)} • Created {formatDate(booking.created_at)}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getStatusColor(booking.status)} className="capitalize">
                  {booking.status}
                </Badge>
                <Badge variant={booking.payment_status === "paid" ? "default" : "outline"} className="capitalize">
                  {booking.payment_status}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Rental Period</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Locations</p>
                  <p className="text-sm text-muted-foreground">
                    {booking.pickup_location} → {booking.dropoff_location}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Total Amount</p>
                  <p className="text-sm text-muted-foreground">GH₵ {booking.total_amount}</p>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                License Plate: {booking.cars.license_plate} • Color: {booking.cars.color}
              </div>
              <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm" className="bg-transparent">
                  <Link href={`/booking/confirmation/${booking.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Link>
                </Button>
                {canCancelBooking(booking) && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleCancelBooking(booking.id)}
                    disabled={cancellingId === booking.id}
                  >
                    <X className="h-4 w-4 mr-2" />
                    {cancellingId === booking.id ? "Cancelling..." : "Cancel"}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
