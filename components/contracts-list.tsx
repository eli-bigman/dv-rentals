"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Calendar, Car, CheckCircle, Clock } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

interface ContractsListProps {
  contracts: any[]
}

export function ContractsList({ contracts }: ContractsListProps) {
  if (contracts.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Contracts Yet</h3>
          <p className="text-muted-foreground mb-4">
            Your rental agreements will appear here once you complete a booking.
          </p>
          <Button asChild>
            <Link href="/cars">Browse Cars</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {contracts.map((contract) => (
        <Card key={contract.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Contract #{contract.id.slice(0, 8)}
              </CardTitle>
              <Badge variant={contract.status === "signed" ? "default" : "secondary"}>
                {contract.status === "signed" ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" /> Signed
                  </>
                ) : (
                  <>
                    <Clock className="h-3 w-3 mr-1" /> Pending
                  </>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {contract.bookings.cars.make} {contract.bookings.cars.model}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {contract.bookings.cars.year} • {contract.bookings.cars.license_plate}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Rental Period</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(contract.bookings.pickup_date), "MMM d")} -{" "}
                    {format(new Date(contract.bookings.return_date), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
              <div>
                <p className="font-medium">Total Amount</p>
                <p className="text-sm text-muted-foreground">GH₵ {contract.bookings.total_amount}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Created {format(new Date(contract.created_at), "PPP")}
                {contract.signed_at && <span> • Signed {format(new Date(contract.signed_at), "PPP")}</span>}
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href={`/contracts/${contract.booking_id}`}>View Contract</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
