"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface BookingData {
  carId: string
  userId: string
  startDate: string
  endDate: string
  pickupLocation: string
  dropoffLocation: string
  pickupTime: string
  dropoffTime: string
  totalDays: number
  dailyRate: number
  subtotal: number
  insuranceFee: number
  taxAmount: number
  totalAmount: number
  specialRequests?: string
}

export async function createBooking(data: BookingData) {
  try {
    const supabase = await createClient()

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user || user.id !== data.userId) {
      return { success: false, error: "Unauthorized" }
    }

    // Check if car is still available
    const { data: car, error: carError } = await supabase.from("cars").select("status").eq("id", data.carId).single()

    if (carError || !car || car.status !== "available") {
      return { success: false, error: "Car is no longer available" }
    }

    // Check for conflicting bookings
    const { data: conflictingBookings, error: conflictError } = await supabase
      .from("bookings")
      .select("id")
      .eq("car_id", data.carId)
      .in("status", ["pending", "confirmed", "active"])
      .or(`start_date.lte.${data.endDate},end_date.gte.${data.startDate}`)

    if (conflictError) {
      return { success: false, error: "Error checking availability" }
    }

    if (conflictingBookings && conflictingBookings.length > 0) {
      return { success: false, error: "Car is not available for the selected dates" }
    }

    // Create the booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        user_id: data.userId,
        car_id: data.carId,
        start_date: data.startDate,
        end_date: data.endDate,
        pickup_location: data.pickupLocation,
        dropoff_location: data.dropoffLocation,
        pickup_time: data.pickupTime,
        dropoff_time: data.dropoffTime,
        total_days: data.totalDays,
        daily_rate: data.dailyRate,
        subtotal: data.subtotal,
        insurance_fee: data.insuranceFee,
        tax_amount: data.taxAmount,
        total_amount: data.totalAmount,
        special_requests: data.specialRequests,
        status: "pending",
        payment_status: "pending",
      })
      .select()
      .single()

    if (bookingError) {
      return { success: false, error: "Failed to create booking" }
    }

    revalidatePath("/bookings")
    return { success: true, bookingId: booking.id }
  } catch (error) {
    console.error("Booking creation error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function cancelBooking(bookingId: string) {
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
      .eq("id", bookingId)
      .eq("user_id", user.id)
      .single()

    if (bookingError || !booking) {
      return { success: false, error: "Booking not found" }
    }

    if (booking.status === "cancelled") {
      return { success: false, error: "Booking is already cancelled" }
    }

    if (booking.status === "completed") {
      return { success: false, error: "Cannot cancel completed booking" }
    }

    // Update booking status
    const { error: updateError } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", bookingId)

    if (updateError) {
      return { success: false, error: "Failed to cancel booking" }
    }

    revalidatePath("/bookings")
    return { success: true }
  } catch (error) {
    console.error("Booking cancellation error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
