import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ContractsList } from "@/components/contracts-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function ContractsPage() {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get user's contracts
  const { data: contracts } = await supabase
    .from("contracts")
    .select(`
      *,
      bookings (
        *,
        cars (make, model, year, license_plate)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Contracts</h1>
              <p className="text-muted-foreground mt-2">View and manage your rental agreements</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/bookings">Back to Bookings</Link>
            </Button>
          </div>

          <ContractsList contracts={contracts || []} />
        </div>
      </div>
    </div>
  )
}
