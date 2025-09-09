"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function generateContract(bookingId: string) {
  try {
    const supabase = createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Check if contract already exists
    const { data: existingContract } = await supabase.from("contracts").select("*").eq("booking_id", bookingId).single()

    if (existingContract) {
      return { success: true, contract: existingContract }
    }

    // Get booking details
    const { data: booking } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .eq("user_id", user.id)
      .single()

    if (!booking) {
      return { success: false, error: "Booking not found" }
    }

    // Generate contract terms
    const contractTerms = {
      rental_duration: Math.ceil(
        (new Date(booking.return_date).getTime() - new Date(booking.pickup_date).getTime()) / (1000 * 60 * 60 * 24),
      ),
      security_deposit: booking.total_amount * 0.3, // 30% of total as security deposit
      late_fee_per_hour: 50,
      fuel_policy: "same_level",
      mileage_limit: 200, // km per day
      excess_mileage_fee: 2, // GH₵ per km
    }

    // Create contract
    const { data: contract, error } = await supabase
      .from("contracts")
      .insert({
        booking_id: bookingId,
        user_id: user.id,
        contract_terms: contractTerms,
        status: "pending",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating contract:", error)
      return { success: false, error: "Failed to generate contract" }
    }

    revalidatePath(`/contracts/${bookingId}`)
    return { success: true, contract }
  } catch (error) {
    console.error("Error in generateContract:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function signContract(contractId: string, signatureData: string) {
  try {
    const supabase = createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Update contract with signature
    const { data: contract, error } = await supabase
      .from("contracts")
      .update({
        status: "signed",
        signature_data: signatureData,
        signed_at: new Date().toISOString(),
      })
      .eq("id", contractId)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("Error signing contract:", error)
      return { success: false, error: "Failed to sign contract" }
    }

    // Update booking status to confirmed
    await supabase.from("bookings").update({ status: "confirmed" }).eq("id", contract.booking_id)

    revalidatePath(`/contracts/${contract.booking_id}`)
    revalidatePath("/bookings")
    return { success: true, contract }
  } catch (error) {
    console.error("Error in signContract:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function getContractsByUser() {
  try {
    const supabase = createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const { data: contracts, error } = await supabase
      .from("contracts")
      .select(`
        *,
        bookings (
          *,
          cars (make, model, year)
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching contracts:", error)
      return { success: false, error: "Failed to fetch contracts" }
    }

    return { success: true, contracts }
  } catch (error) {
    console.error("Error in getContractsByUser:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
