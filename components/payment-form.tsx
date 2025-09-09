"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { processPayment } from "@/lib/actions/payment"
import { Smartphone, CreditCard, Building, Wallet } from "lucide-react"

interface PaymentFormProps {
  booking: any
}

export function PaymentForm({ booking }: PaymentFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [paymentMethod, setPaymentMethod] = useState("mobile_money")
  const [paymentData, setPaymentData] = useState({
    mobileProvider: "mtn",
    mobileNumber: "",
    bankName: "",
    accountNumber: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setPaymentData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      let paymentProvider = ""
      let transactionReference = ""

      // Generate mock transaction reference
      const generateRef = () => `TXN${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`

      switch (paymentMethod) {
        case "mobile_money":
          if (!paymentData.mobileNumber) {
            setError("Please enter your mobile number")
            setIsLoading(false)
            return
          }
          paymentProvider = paymentData.mobileProvider.toUpperCase()
          transactionReference = generateRef()
          break
        case "bank_transfer":
          if (!paymentData.bankName || !paymentData.accountNumber) {
            setError("Please enter your bank details")
            setIsLoading(false)
            return
          }
          paymentProvider = paymentData.bankName
          transactionReference = generateRef()
          break
        case "card":
          if (!paymentData.cardNumber || !paymentData.expiryDate || !paymentData.cvv) {
            setError("Please enter complete card details")
            setIsLoading(false)
            return
          }
          paymentProvider = "VISA/MASTERCARD"
          transactionReference = generateRef()
          break
        default:
          setError("Please select a payment method")
          setIsLoading(false)
          return
      }

      const result = await processPayment({
        bookingId: booking.id,
        amount: booking.total_amount,
        paymentMethod,
        paymentProvider,
        transactionReference,
      })

      if (result.success) {
        router.push(`/payment/success/${booking.id}`)
      } else {
        setError(result.error || "Payment failed")
      }
    } catch (error) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Payment Method</CardTitle>
          <CardDescription>Choose your preferred payment option</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
            {/* Mobile Money */}
            <div className="flex items-center space-x-2 p-4 border rounded-lg">
              <RadioGroupItem value="mobile_money" id="mobile_money" />
              <div className="flex-1">
                <Label htmlFor="mobile_money" className="flex items-center gap-2 cursor-pointer">
                  <Smartphone className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">Mobile Money</div>
                    <div className="text-sm text-muted-foreground">MTN, Vodafone, AirtelTigo</div>
                  </div>
                </Label>
              </div>
            </div>

            {/* Bank Transfer */}
            <div className="flex items-center space-x-2 p-4 border rounded-lg">
              <RadioGroupItem value="bank_transfer" id="bank_transfer" />
              <div className="flex-1">
                <Label htmlFor="bank_transfer" className="flex items-center gap-2 cursor-pointer">
                  <Building className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">Bank Transfer</div>
                    <div className="text-sm text-muted-foreground">Direct bank account transfer</div>
                  </div>
                </Label>
              </div>
            </div>

            {/* Card Payment */}
            <div className="flex items-center space-x-2 p-4 border rounded-lg">
              <RadioGroupItem value="card" id="card" />
              <div className="flex-1">
                <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">Credit/Debit Card</div>
                    <div className="text-sm text-muted-foreground">Visa, Mastercard</div>
                  </div>
                </Label>
              </div>
            </div>

            {/* Cash Payment */}
            <div className="flex items-center space-x-2 p-4 border rounded-lg">
              <RadioGroupItem value="cash" id="cash" />
              <div className="flex-1">
                <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer">
                  <Wallet className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">Cash Payment</div>
                    <div className="text-sm text-muted-foreground">Pay at pickup location</div>
                  </div>
                </Label>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Payment Details */}
      {paymentMethod === "mobile_money" && (
        <Card>
          <CardHeader>
            <CardTitle>Mobile Money Details</CardTitle>
            <CardDescription>Enter your mobile money information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mobileProvider">Mobile Network</Label>
              <Select
                value={paymentData.mobileProvider}
                onValueChange={(value) => handleInputChange("mobileProvider", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                  <SelectItem value="vodafone">Vodafone Cash</SelectItem>
                  <SelectItem value="airteltigo">AirtelTigo Money</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobileNumber">Mobile Number</Label>
              <Input
                id="mobileNumber"
                type="tel"
                placeholder="+233 XX XXX XXXX"
                value={paymentData.mobileNumber}
                onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>
      )}

      {paymentMethod === "bank_transfer" && (
        <Card>
          <CardHeader>
            <CardTitle>Bank Transfer Details</CardTitle>
            <CardDescription>Enter your bank account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Select value={paymentData.bankName} onValueChange={(value) => handleInputChange("bankName", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your bank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gcb">GCB Bank</SelectItem>
                  <SelectItem value="ecobank">Ecobank Ghana</SelectItem>
                  <SelectItem value="stanbic">Stanbic Bank</SelectItem>
                  <SelectItem value="absa">Absa Bank Ghana</SelectItem>
                  <SelectItem value="fidelity">Fidelity Bank</SelectItem>
                  <SelectItem value="cal">CAL Bank</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                type="text"
                placeholder="Enter your account number"
                value={paymentData.accountNumber}
                onChange={(e) => handleInputChange("accountNumber", e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>
      )}

      {paymentMethod === "card" && (
        <Card>
          <CardHeader>
            <CardTitle>Card Details</CardTitle>
            <CardDescription>Enter your credit or debit card information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardholderName">Cardholder Name</Label>
              <Input
                id="cardholderName"
                type="text"
                placeholder="Name on card"
                value={paymentData.cardholderName}
                onChange={(e) => handleInputChange("cardholderName", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                type="text"
                placeholder="1234 5678 9012 3456"
                value={paymentData.cardNumber}
                onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="text"
                  placeholder="MM/YY"
                  value={paymentData.expiryDate}
                  onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  type="text"
                  placeholder="123"
                  value={paymentData.cvv}
                  onChange={(e) => handleInputChange("cvv", e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {paymentMethod === "cash" && (
        <Card>
          <CardHeader>
            <CardTitle>Cash Payment</CardTitle>
            <CardDescription>Pay when you pick up your rental car</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                You can pay in cash when you arrive at the pickup location. Please bring the exact amount or be prepared
                for change. A receipt will be provided upon payment.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
        {isLoading
          ? "Processing Payment..."
          : paymentMethod === "cash"
            ? "Confirm Cash Payment"
            : `Pay GH₵ ${booking.total_amount}`}
      </Button>
    </form>
  )
}
