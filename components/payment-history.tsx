import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CreditCard, Calendar, Car, Eye } from "lucide-react"

interface PaymentHistoryProps {
  payments: Array<{
    id: string
    amount: number
    payment_method: string
    payment_provider: string
    transaction_reference: string
    status: string
    payment_date: string
    created_at: string
    bookings: {
      id: string
      start_date: string
      end_date: string
      cars: {
        make: string
        model: string
        year: number
        license_plate: string
      }
    }
  }>
}

export function PaymentHistory({ payments }: PaymentHistoryProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "failed":
        return "destructive"
      case "pending":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getPaymentMethodDisplay = (method: string) => {
    switch (method) {
      case "mobile_money":
        return "Mobile Money"
      case "bank_transfer":
        return "Bank Transfer"
      case "card":
        return "Card Payment"
      case "cash":
        return "Cash Payment"
      default:
        return method
    }
  }

  if (!payments || payments.length === 0) {
    return (
      <div className="text-center py-12">
        <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No payments found</h3>
        <p className="text-muted-foreground mb-6">You haven't made any payments yet.</p>
        <Button asChild>
          <Link href="/cars">Browse Available Cars</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {payments.map((payment) => (
        <Card key={payment.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  GH₵ {payment.amount}
                </CardTitle>
                <CardDescription>
                  Transaction ID: {payment.transaction_reference} • {formatDate(payment.created_at)}
                </CardDescription>
              </div>
              <Badge variant={getStatusColor(payment.status)} className="capitalize">
                {payment.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Vehicle</p>
                  <p className="text-sm text-muted-foreground">
                    {payment.bookings.cars.year} {payment.bookings.cars.make} {payment.bookings.cars.model}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Rental Period</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(payment.bookings.start_date)} - {formatDate(payment.bookings.end_date)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Payment Method</p>
                  <p className="text-sm text-muted-foreground">
                    {getPaymentMethodDisplay(payment.payment_method)}
                    {payment.payment_provider && ` (${payment.payment_provider})`}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                License Plate: {payment.bookings.cars.license_plate}
                {payment.payment_date && ` • Paid: ${formatDate(payment.payment_date)}`}
              </div>
              <Button asChild variant="outline" size="sm" className="bg-transparent">
                <Link href={`/booking/confirmation/${payment.bookings.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Booking
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
