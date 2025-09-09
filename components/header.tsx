"use client"

import { useState, useEffect } from 'react'
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Car, ArrowLeft, LogOut, LogIn } from "lucide-react"

interface HeaderProps {
  showBackButton?: boolean
  backHref?: string
  backLabel?: string
}

export function Header({ showBackButton = true, backHref = "/", backLabel = "Back" }: HeaderProps) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const supabase = createClient()
    
    // Check authentication status
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    
    checkUser()
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])
  
  const handleSignOut = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh() // Refresh the page to update UI
    setLoading(false)
  }
  
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <Button asChild variant="ghost" size="sm">
                <Link href={backHref}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {backLabel}
                </Link>
              </Button>
            )}
            <div className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                <Car className="h-6 w-6" />
              </div>
              <Link href="/" className="text-2xl font-bold text-primary hover:opacity-90 transition-opacity">
                DV Rentals
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {loading ? (
              <Button variant="ghost" disabled>
                Loading...
              </Button>
            ) : user ? (
              <>
                <Button onClick={handleSignOut} variant="ghost">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
                <Button asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link href="/auth/login">
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/cars">Browse Cars</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
