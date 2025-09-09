"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ESignature } from "@/components/e-signature"
import { generateContract, signContract } from "@/lib/actions/contract"
import { CalendarDays, Car, MapPin, Phone, Mail, FileText, CheckCircle } from "lucide-react"
import { format } from "date-fns"

interface ContractViewerProps {
  booking: any
  contract: any
}

export function ContractViewer({ booking, contract }: ContractViewerProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSigning, setIsSigning] = useState(false)
  const [currentContract, setCurrentContract] = useState(contract)
  const [showSignature, setShowSignature] = useState(false)

  const handleGenerateContract = async () => {
    setIsGenerating(true)
    try {
      const result = await generateContract(booking.id)
      if (result.success) {
        setCurrentContract(result.contract)
      }
    } catch (error) {
      console.error("Error generating contract:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSignContract = async (signatureData: string) => {
    setIsSigning(true)
    try {
      const result = await signContract(currentContract.id, signatureData)
      if (result.success) {
        setCurrentContract(result.contract)
        setShowSignature(false)
      }
    } catch (error) {
      console.error("Error signing contract:", error)
    } finally {
      setIsSigning(false)
    }
  }

  if (!currentContract) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Rental Contract
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            A rental agreement needs to be generated for this booking before you can proceed with the rental.
          </p>
          <Button onClick={handleGenerateContract} disabled={isGenerating} className="w-full">
            {isGenerating ? "Generating Contract..." : "Generate Rental Agreement"}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Contract Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Contract Status
            </CardTitle>
            <Badge variant={currentContract.status === "signed" ? "default" : "secondary"}>
              {currentContract.status === "signed" ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" /> Signed
                </>
              ) : (
                "Pending Signature"
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium text-muted-foreground">Contract ID</p>
              <p className="font-mono">{currentContract.id.slice(0, 8)}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Generated</p>
              <p>{format(new Date(currentContract.created_at), "PPP")}</p>
            </div>
            {currentContract.signed_at && (
              <div>
                <p className="font-medium text-muted-foreground">Signed</p>
                <p>{format(new Date(currentContract.signed_at), "PPP")}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contract Details */}
      <Card>
        <CardHeader>
          <CardTitle>Rental Agreement Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Parties */}
          <div>
            <h3 className="font-semibold mb-3">Parties to the Agreement</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-ghana-gold">Rental Company</h4>
                <div className="text-sm space-y-1">
                  <p className="font-medium">DV Rentals Ghana Ltd.</p>
                  <p className="flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    Accra, Greater Accra Region, Ghana
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    +233 24 123 4567
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    info@dvrentals.com.gh
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-ghana-gold">Renter</h4>
                <div className="text-sm space-y-1">
                  <p className="font-medium">{booking.users.full_name}</p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    {booking.users.phone}
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    {booking.users.email}
                  </p>
                  <p className="text-xs text-muted-foreground">License: {booking.users.drivers_license}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Vehicle Details */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Car className="h-4 w-4" />
              Vehicle Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Make & Model:</span> {booking.cars.make} {booking.cars.model}
                </p>
                <p>
                  <span className="font-medium">Year:</span> {booking.cars.year}
                </p>
                <p>
                  <span className="font-medium">License Plate:</span> {booking.cars.license_plate}
                </p>
              </div>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Color:</span> {booking.cars.color}
                </p>
                <p>
                  <span className="font-medium">Fuel Type:</span> {booking.cars.fuel_type}
                </p>
                <p>
                  <span className="font-medium">Transmission:</span> {booking.cars.transmission}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Rental Terms */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Rental Terms
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Pickup Date:</span> {format(new Date(booking.pickup_date), "PPP")}
                </p>
                <p>
                  <span className="font-medium">Return Date:</span> {format(new Date(booking.return_date), "PPP")}
                </p>
                <p>
                  <span className="font-medium">Pickup Location:</span> {booking.pickup_location}
                </p>
              </div>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Return Location:</span> {booking.return_location}
                </p>
                <p>
                  <span className="font-medium">Total Amount:</span> GH₵ {booking.total_amount}
                </p>
                <p>
                  <span className="font-medium">Security Deposit:</span> GH₵ {booking.cars.daily_rate * 2}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Terms and Conditions */}
          <div>
            <h3 className="font-semibold mb-3">Terms and Conditions</h3>
            <div className="text-sm space-y-2 text-muted-foreground">
              <p>1. The renter must be at least 21 years old with a valid Ghana driver's license.</p>
              <p>2. The vehicle must be returned in the same condition as received.</p>
              <p>
                3. The renter is responsible for all traffic violations and fines incurred during the rental period.
              </p>
              <p>4. Fuel tank must be returned at the same level as received.</p>
              <p>5. Late return fees apply at GH₵ 50 per hour after the agreed return time.</p>
              <p>6. The security deposit will be refunded within 7 business days after vehicle inspection.</p>
              <p>7. This agreement is governed by the laws of Ghana.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signature Section */}
      {currentContract.status !== "signed" && (
        <Card>
          <CardHeader>
            <CardTitle>Digital Signature</CardTitle>
          </CardHeader>
          <CardContent>
            {!showSignature ? (
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  By signing this agreement, you acknowledge that you have read and agree to all terms and conditions.
                </p>
                <Button onClick={() => setShowSignature(true)}>Sign Agreement</Button>
              </div>
            ) : (
              <ESignature onSign={handleSignContract} onCancel={() => setShowSignature(false)} isLoading={isSigning} />
            )}
          </CardContent>
        </Card>
      )}

      {/* Signed Contract Display */}
      {currentContract.status === "signed" && currentContract.signature_data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Signed Agreement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <p className="text-green-600 font-medium">
                This agreement has been digitally signed and is legally binding.
              </p>
              <div className="border rounded-lg p-4 bg-muted/50">
                <p className="text-sm text-muted-foreground mb-2">Digital Signature:</p>
                <img
                  src={currentContract.signature_data || "/placeholder.svg"}
                  alt="Digital Signature"
                  className="mx-auto border rounded"
                  style={{ maxWidth: "300px", maxHeight: "100px" }}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Signed on {format(new Date(currentContract.signed_at), "PPP p")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
