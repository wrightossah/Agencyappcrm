"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./auth-provider"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Add the TrialBanner component at the top of the file, after the imports
const TrialBanner = ({ trialEndDate }: { trialEndDate: string }) => {
  const trialEnd = new Date(trialEndDate)
  const today = new Date()
  const daysLeft = Math.ceil((trialEnd - today) / (1000 * 60 * 60 * 24))

  if (daysLeft <= 0) return null

  return (
    <div className="bg-yellow-100 text-yellow-800 p-4 rounded-xl mb-4 text-center">
      Your trial ends in <strong>{daysLeft}</strong> day(s). Subscribe now to avoid interruption.
    </div>
  )
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [trialStatus, setTrialStatus] = useState<{
    loading: boolean
    error: string | null
    daysLeft: number | null
    hasActiveSubscription: boolean
    trialEnded: boolean
  }>({
    loading: true,
    error: null,
    daysLeft: null,
    hasActiveSubscription: false,
    trialEnded: false,
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const checkTrialStatus = async () => {
      if (!user) return

      try {
        // Check if user has an active subscription
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .order("end_date", { ascending: false })
          .limit(1)

        if (subscriptionError) throw subscriptionError

        const hasActiveSubscription =
          subscriptionData && subscriptionData.length > 0 && new Date(subscriptionData[0].end_date) > new Date()

        // Get user profile with trial information
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileError) {
          // If profile doesn't exist, we'll use default trial values
          // Instead of trying to create a profile (which causes RLS error)
          if (profileError.code === "PGRST116") {
            // Calculate default trial dates
            const trialStartDate = new Date()
            const trialEndDate = new Date(trialStartDate)
            trialEndDate.setDate(trialEndDate.getDate() + 14)

            // Use default values without trying to insert into the database
            // This avoids the RLS error
            setTrialStatus({
              loading: false,
              error: null,
              daysLeft: 14,
              hasActiveSubscription,
              trialEnded: false,
            })

            console.log("Using default trial values for new user")
            return
          } else {
            throw profileError
          }
        }

        // Calculate days left in trial using the provided calculation
        const today = new Date()
        const trialEndDate = new Date(profileData.trial_end_date)
        const daysLeft = Math.ceil((trialEndDate - today) / (1000 * 60 * 60 * 24))

        // Update subscription status if needed - only if we have a profile
        if (hasActiveSubscription && !profileData.has_active_subscription) {
          try {
            await supabase.from("profiles").update({ has_active_subscription: true }).eq("id", user.id)
          } catch (updateError) {
            console.error("Error updating subscription status:", updateError)
            // Continue even if update fails
          }
        }

        // Check if trial has ended and user doesn't have an active subscription
        const trialEnded = daysLeft <= 0 && !hasActiveSubscription

        if (trialEnded) {
          setTrialStatus({
            loading: false,
            error: "Your trial has ended. Please subscribe to continue using the app.",
            daysLeft: 0,
            hasActiveSubscription,
            trialEnded: true,
          })

          // Add the redirect logic here
          if (!hasActiveSubscription && new Date() > trialEndDate) {
            router.push("/dashboard/subscription")
          }
        } else {
          setTrialStatus({
            loading: false,
            error: null,
            daysLeft,
            hasActiveSubscription,
            trialEnded: false,
          })
        }
      } catch (error: any) {
        console.error("Error checking trial status:", error)
        // Fallback to default values if there's an error
        setTrialStatus({
          loading: false,
          error: null,
          daysLeft: 14, // Default to 14 days trial
          hasActiveSubscription: false,
          trialEnded: false,
        })
      }
    }

    if (user) {
      checkTrialStatus()
    }
  }, [user, router])

  if (loading || trialStatus.loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (trialStatus.trialEnded) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="text-center p-6 bg-red-100 rounded-xl">
            <h2 className="text-red-600 text-xl font-semibold mb-2">Trial Expired</h2>
            <p className="mb-4">
              Your 14-day free trial has ended. Please subscribe to continue using the application.
            </p>
            <Link href="/dashboard/subscription">
              <Button className="bg-red-600 text-white hover:bg-red-700">Subscribe Now</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Add the warning banner for 3 or fewer days left */}
      {!trialStatus.hasActiveSubscription &&
        trialStatus.daysLeft !== null &&
        trialStatus.daysLeft > 0 &&
        trialStatus.daysLeft <= 3 && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
            <p className="container mx-auto px-2 sm:px-4 text-sm sm:text-base">
              Your free trial ends in{" "}
              <strong>
                {trialStatus.daysLeft} day{trialStatus.daysLeft === 1 ? "" : "s"}
              </strong>
              . Please{" "}
              <Link href="/dashboard/subscription" className="text-blue-600 underline">
                subscribe now
              </Link>{" "}
              to avoid losing access.
            </p>
          </div>
        )}

      {/* Keep the existing trial banner */}
      {trialStatus.daysLeft !== null && trialStatus.daysLeft > 0 && !trialStatus.hasActiveSubscription && (
        <TrialBanner
          trialEndDate={user?.trial_end_date || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()}
        />
      )}
      {children}
    </>
  )
}
