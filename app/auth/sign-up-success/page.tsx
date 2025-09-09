import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Car, Mail } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
              <Car className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-primary">DV Rentals</h1>
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 bg-secondary/10 text-secondary p-3 rounded-full w-fit">
              <Mail className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription>We've sent you a confirmation link</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Thank you for signing up with DV Rentals! We've sent a confirmation email to your inbox. Please click the
              link in the email to verify your account and complete your registration.
            </p>
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Didn't receive the email?</strong> Check your spam folder or contact our support team.
              </p>
            </div>
            <Button asChild className="w-full">
              <Link href="/auth/login">Return to Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
