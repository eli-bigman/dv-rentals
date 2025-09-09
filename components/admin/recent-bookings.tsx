import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Eye, Calendar, User } from "lucide-react"

interface RecentBookingsProps {
  bookings: Array<{
    id: string
    start_date: string
    end_date: string
    total_amount: number
    status: string
    payment_status: string
    created_at: string
    users: {
      full_name: string
      phone_number: string
    }
    cars: {
      make: string
      model: string
      year: number
      license_plate: string
    }
  }>
}

export function RecentBookings({ bookings }: RecentBookingsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
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

  if (!bookings || bookings.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">No recent bookings</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{booking.users.full_name}</span>
              <Badge variant={getStatusColor(booking.status)} className="capitalize">
                {booking.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {booking.cars.year} {booking.cars.make} {booking.cars.model} • {booking.cars.license_plate}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatDate(booking.start_date)} - {formatDate(booking.end_date)} • GH₵ {booking.total_amount}
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="bg-transparent">
            <Link href={`/admin/bookings/${booking.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ))}
    </div>
  )
}
