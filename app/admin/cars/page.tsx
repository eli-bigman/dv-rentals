import { createClient } from "@/lib/supabase/server"
import { CarManagement } from "@/components/admin/car-management"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Car, ArrowLeft, Plus } from "lucide-react"

export default async function AdminCarsPage() {
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

  // Get all cars
  const { data: cars, error } = await supabase.from("cars").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching cars:", error)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Admin Dashboard
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                  <Car className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-primary">Car Management</h1>
                  <p className="text-sm text-muted-foreground">Manage your fleet</p>
                </div>
              </div>
            </div>
            <Button asChild>
              <Link href="/admin/cars/add">
                <Plus className="h-4 w-4 mr-2" />
                Add Car
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Fleet Management</h1>
          <p className="text-muted-foreground">{cars?.length || 0} vehicles in your fleet</p>
        </div>

        <CarManagement cars={cars || []} />
      </div>
    </div>
  )
}
