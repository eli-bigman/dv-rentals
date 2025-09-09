"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface PaymentData {
  bookingId: string
  amount: number
  paymentMethod: string
  paymentProvider: string
  transactionReference: string
}

export async function processPayment(data: PaymentData) {
  try {
    const supabase = await createClient()

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: "Unauthorized" }
    }

    // Get booking and verify ownership
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", data.bookingId)
      .eq("user_id", user.id)
      .single()

    if (bookingError || !booking) {
      return { success: false, error: "Booking not found" }
    }

    if (booking.payment_status === "paid") {
      return { success: false, error: "Payment already completed" }
    }

    if (booking.total_amount !== data.amount) {
      return { success: false, error: "Payment amount mismatch" }
    }

    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Simulate payment success/failure (90% success rate)
    const paymentSuccess = Math.random() > 0.1

    if (!paymentSuccess) {
      // Create failed payment record
      await supabase.from("payments").insert({
        booking_id: data.bookingId,
        amount: data.amount,
        payment_method: data.paymentMethod,
        payment_provider: data.paymentProvider,
        transaction_reference: data.transactionReference,
        status: "failed",
      })

      return { success: false, error: "Payment failed. Please try again." }
    }

    // Create successful payment record
    const { data: payment, error: paymentInsertError } = await supabase
      .from("payments")
      .insert({
        booking_id: data.bookingId,
        amount: data.amount,
        payment_method: data.paymentMethod,
        payment_provider: data.paymentProvider,
        transaction_reference: data.transactionReference,
        status: "completed",
        payment_date: new Date().toISOString(),
      })
      .select()
      .single()

    if (paymentInsertError) {
      return { success: false, error: "Failed to record payment" }
    }

    // Update booking payment status
    const { error: bookingUpdateError } = await supabase
      .from("bookings")
      .update({
        payment_status: "paid",
        status: "confirmed",
      })
      .eq("id", data.bookingId)

    if (bookingUpdateError) {
      return { success: false, error: "Failed to update booking status" }
    }

    // For cash payments, keep booking as pending until actual payment
    if (data.paymentMethod === "cash") {
      await supabase
        .from("bookings")
        .update({
          payment_status: "pending",
          status: "confirmed",
        })
        .eq("id", data.bookingId)
    }

    revalidatePath("/bookings")
    revalidatePath(`/booking/confirmation/${data.bookingId}`)

    return { success: true, paymentId: payment.id }
  } catch (error) {
    console.error("Payment processing error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function getPaymentHistory(userId: string) {
  try {
    const supabase = await createClient()

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user || user.id !== userId) {
      return { success: false, error: "Unauthorized" }
    }

    const { data: payments, error } = await supabase
      .from("payments")
      .select(`
        *,
        bookings (
          *,
          cars (make, model, year)
        )
      `)
      .eq("bookings.user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      return { success: false, error: "Failed to fetch payment history" }
    }

    return { success: true, payments }
  } catch (error) {
    console.error("Payment history error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
