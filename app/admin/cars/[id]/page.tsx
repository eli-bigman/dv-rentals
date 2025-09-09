import { createClient } from "@/lib/supabase/server"
import { CarEditForm } from "@/components/admin/car-edit-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft, Car } from "lucide-react"

interface EditCarPageProps {
  params: {
    id: string
  }
}

export default async function EditCarPage({ params }: EditCarPageProps) {
  const { id } = params
  const supabase = await createClient()

  // Check if user is authenticated and is admin
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/auth/login")
  }

  // Check if user has admin role
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()
  if (!profile || !["admin", "staff"].includes(profile.role)) {
    redirect("/dashboard")
  }

  // Get car data
  const { data: car, error } = await supabase.from("cars").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching car:", error)
    redirect("/admin/cars")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/cars">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Cars
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                  <Car className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-primary">Edit Car</h1>
                  <p className="text-sm text-muted-foreground">
                    {car.year} {car.make} {car.model} • {car.license_plate}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <CarEditForm car={car} />
        </div>
      </div>
    </div>
  )
}
