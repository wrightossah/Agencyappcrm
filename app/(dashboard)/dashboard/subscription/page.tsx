"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { Loader2, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Add trial information to the subscription page
// Add this after the imports and before the component definition
interface Profile {
  id: string
  trial_start_date: string
  trial_end_date: string
  has_active_subscription: boolean
}

// Define subscription type
interface Subscription {
  id: string
  user_id: string
  phone_number: string
  duration_months: number
  amount_paid: number
  amount: number // Add this field to match the database schema
  transaction_id: string
  start_date: string
  end_date: string
  created_at: string
}

export default function SubscriptionPage() {
  // Add these states to the component
  const [trialInfo, setTrialInfo] = useState<{
    daysLeft: number | null
    endDate: Date | null
  }>({
    daysLeft: null,
    endDate: null,
  })
  const [phoneNumber, setPhoneNumber] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const [months, setMonths] = useState(1)
  const [loading, setLoading] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null)
  const [mobileMoneyProvider, setMobileMoneyProvider] = useState("mtn")
  const { toast } = useToast()
  const router = useRouter()
  const { user } = useAuth()

  // Calculate total cost
  const costPerMonth = 10
  let totalCost = 0
  let savings = 0

  if (months === 12) {
    totalCost = 100 // 12 months plan, user pays GHC 100 (gets 2 months free)
    savings = months * costPerMonth - totalCost
  } else if (months === 24) {
    totalCost = 200 // 24 months plan, user pays GHC 200 (gets 4 months free)
    savings = months * costPerMonth - totalCost
  } else {
    totalCost = costPerMonth * months // Regular price for 1-11 months
  }

  // Fetch current subscription on component mount
  useEffect(() => {
    if (user) {
      fetchCurrentSubscription()
    }
  }, [user])

  // Add this useEffect to fetch trial information
  useEffect(() => {
    const fetchTrialInfo = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("trial_start_date, trial_end_date")
          .eq("id", user.id)
          .single()

        if (error) {
          console.log("No profile found, using default trial period")
          // Default to 14 days trial if no profile exists
          const defaultEndDate = new Date()
          defaultEndDate.setDate(defaultEndDate.getDate() + 14)

          setTrialInfo({
            daysLeft: 14,
            endDate: defaultEndDate,
          })
          return
        }

        if (data) {
          const today = new Date()
          const trialEnd = new Date(data.trial_end_date)
          const daysLeft = Math.ceil((trialEnd - today) / (1000 * 60 * 60 * 24))

          setTrialInfo({
            daysLeft: daysLeft > 0 ? daysLeft : 0,
            endDate: trialEnd,
          })
        }
      } catch (error) {
        console.error("Error fetching trial info:", error)
        // Default to 14 days trial if there's an error
        const defaultEndDate = new Date()
        defaultEndDate.setDate(defaultEndDate.getDate() + 14)

        setTrialInfo({
          daysLeft: 14,
          endDate: defaultEndDate,
        })
      }
    }

    fetchTrialInfo()
  }, [user])

  // Load Paystack script
  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://js.paystack.co/v2/inline.js"
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const fetchCurrentSubscription = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)

      if (error) throw error

      if (data && data.length > 0) {
        setCurrentSubscription(data[0] as Subscription)
      }
    } catch (error: any) {
      console.error("Error fetching subscription:", error.message)
      toast({
        title: "Error",
        description: "Failed to fetch subscription details.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const validatePhoneNumber = (number: string) => {
    // Validate Ghanaian phone number (10 digits starting with 0)
    const regex = /^0\d{9}$/
    if (!regex.test(number)) {
      setPhoneError("Please enter a valid Ghanaian phone number (10 digits starting with 0)")
      return false
    }
    setPhoneError("")
    return true
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPhoneNumber(value)
    if (value) validatePhoneNumber(value)
  }

  const handleMonthsChange = (value: number[]) => {
    setMonths(value[0])
  }

  // Add email validation to the handlePayment function
  const handlePayment = async () => {
    if (!validatePhoneNumber(phoneNumber)) return
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to subscribe.",
        variant: "destructive",
      })
      return
    }

    // Add email validation
    if (!user.email) {
      alert("Email is required")
      return
    }

    setPaymentLoading(true)

    try {
      // Format phone number for Paystack (remove leading 0 and add Ghana code)
      const formattedPhone = `233${phoneNumber.substring(1)}`

      // Initialize Paystack payment
      // @ts-ignore - Paystack is loaded via script
      const paystack = new window.PaystackPop()
      paystack.newTransaction({
        key: "pk_test_b6a8830d043f2d7420be7f9275209ca34535cf83",
        email: user.email,
        amount: totalCost * 100, // Amount in pesewas
        currency: "GHS",
        channels: ["mobile_money"],
        mobile_money: {
          phone: formattedPhone,
          provider: mobileMoneyProvider,
        },
        ref: `sub_${Date.now()}_${Math.floor(Math.random() * 1000000)}`,
        metadata: {
          user_id: user.id,
          duration_months: months,
        },
        onSuccess: async (transaction: any) => {
          // Handle successful payment
          await saveSubscription(transaction)
        },
        onCancel: () => {
          setPaymentLoading(false)
          toast({
            title: "Payment Cancelled",
            description: "You have cancelled the payment process.",
            variant: "default",
          })
        },
      })
    } catch (error: any) {
      console.error("Payment error:", error)
      toast({
        title: "Payment Error",
        description: error.message || "An error occurred during payment.",
        variant: "destructive",
      })
      setPaymentLoading(false)
    }
  }

  // Fixed saveSubscription function to prevent stack depth limit exceeded error
  const saveSubscription = async (transaction: any) => {
    try {
      if (!user || !user.id) {
        throw new Error("User ID is missing or invalid")
      }

      // Calculate subscription dates
      const startDate = new Date()
      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + months)

      // Create subscription data object with all required fields
      const subscriptionData = {
        user_id: user.id,
        plan_name: months === 1 ? "Monthly" : months === 12 ? "Annual" : "Biennial",
        phone_number: phoneNumber,
        duration_months: months,
        amount_paid: totalCost,
        amount: totalCost, // Add this field to match the database schema
        transaction_id: transaction.reference,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: "active",
      }

      console.log("Saving subscription data:", subscriptionData)

      // Save subscription to Supabase
      const { error: subscriptionError } = await supabase.from("subscriptions").insert([subscriptionData])

      if (subscriptionError) {
        console.error("Database error:", subscriptionError)
        throw subscriptionError
      }

      // Check if profile exists
      const { data: profileData, error: profileCheckError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle()

      // Handle profile update/creation separately to avoid recursion
      if (!profileData || profileCheckError) {
        // Profile doesn't exist, create it
        const trialStartDate = new Date()
        const trialEndDate = new Date(trialStartDate)
        trialEndDate.setDate(trialEndDate.getDate() + 14)

        const { error: createProfileError } = await supabase.from("profiles").insert([
          {
            id: user.id,
            trial_start_date: trialStartDate.toISOString(),
            trial_end_date: trialEndDate.toISOString(),
            has_active_subscription: true,
          },
        ])

        if (createProfileError) {
          console.error("Error creating profile:", createProfileError)
          // Continue even if profile creation fails
        }
      } else {
        // Profile exists, just update subscription status
        const { error: updateProfileError } = await supabase
          .from("profiles")
          .update({ has_active_subscription: true })
          .eq("id", user.id)

        if (updateProfileError) {
          console.error("Error updating profile:", updateProfileError)
          // Continue even if profile update fails
        }
      }

      // Show success message
      toast({
        title: "Subscription Successful",
        description: `Your subscription is active until ${endDate.toLocaleDateString()}.`,
        variant: "default",
      })

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (error: any) {
      console.error("Error saving subscription:", error)
      toast({
        title: "Error",
        description: "Failed to save subscription details. Please contact support.",
        variant: "destructive",
      })
    } finally {
      setPaymentLoading(false)
    }
  }

  const isSubscriptionActive = () => {
    if (!currentSubscription) return false
    const endDate = new Date(currentSubscription.end_date)
    return endDate > new Date()
  }

  const getRemainingDays = () => {
    if (!currentSubscription) return 0
    const endDate = new Date(currentSubscription.end_date)
    const today = new Date()
    const diffTime = endDate.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription plan and billing</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue={isSubscriptionActive() ? "current" : "subscribe"}>
          <TabsList>
            {isSubscriptionActive() && <TabsTrigger value="current">Current Subscription</TabsTrigger>}
            <TabsTrigger value="subscribe">Subscribe</TabsTrigger>
          </TabsList>

          {isSubscriptionActive() && (
            <TabsContent value="current" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Active Subscription</CardTitle>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Active
                    </Badge>
                  </div>
                  <CardDescription>Your current subscription details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium">Subscription Plan</p>
                      <p className="text-lg">CRM Premium</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Duration</p>
                      <p className="text-lg">{currentSubscription?.duration_months} months</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Start Date</p>
                      <p className="text-lg">{new Date(currentSubscription?.start_date || "").toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Expiry Date</p>
                      <p className="text-lg">{new Date(currentSubscription?.end_date || "").toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Amount Paid</p>
                      <p className="text-lg">
                        Ghc {currentSubscription?.amount_paid?.toFixed(2) || currentSubscription?.amount?.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Phone Number</p>
                      <p className="text-lg">{currentSubscription?.phone_number}</p>
                    </div>
                  </div>

                  <Alert className="bg-blue-50 text-blue-800 border-blue-200">
                    <AlertCircle className="h-4 w-4 text-blue-800" />
                    <AlertTitle>Subscription Status</AlertTitle>
                    <AlertDescription>Your subscription is active for {getRemainingDays()} more days.</AlertDescription>
                  </Alert>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => router.push("#subscribe")}>Extend Subscription</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="subscribe" className="space-y-4">
            {/* Add warning banner for 3 or fewer days left */}
            {!currentSubscription &&
              trialInfo.daysLeft !== null &&
              trialInfo.daysLeft > 0 &&
              trialInfo.daysLeft <= 3 && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded">
                  <p>
                    <strong>Urgent:</strong> Your free trial ends in{" "}
                    <strong>
                      {trialInfo.daysLeft} day{trialInfo.daysLeft === 1 ? "" : "s"}
                    </strong>
                    . Please subscribe now to avoid losing access to your data and features.
                  </p>
                </div>
              )}
            {/* Add a trial information card to the subscription page
            Add this inside the TabsContent with value="subscribe", before the first Card */}
            {!currentSubscription &&
              trialInfo.daysLeft !== null &&
              (trialInfo.daysLeft > 0 ? (
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle>Trial Status</CardTitle>
                    <CardDescription>Your current trial period information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 rounded-md bg-yellow-100 text-yellow-800">
                      <h3 className="font-medium text-lg mb-2">Active Trial</h3>
                      <p>
                        Your trial ends in <strong>{trialInfo.daysLeft}</strong> day
                        {trialInfo.daysLeft === 1 ? "" : "s"}
                      </p>
                      <p className="mt-2 text-sm">Subscribe now to ensure uninterrupted access to all features.</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center p-6 bg-red-100 rounded-xl mb-4">
                  <h2 className="text-red-600 text-xl font-semibold mb-2">Trial Expired</h2>
                  <p className="mb-4">Your 14-day free trial has ended. Please subscribe to continue using the app.</p>
                  <p className="text-sm mb-4">Choose a subscription plan below to continue using Agencyapp.</p>
                </div>
              ))}
            <Card>
              <CardHeader>
                <CardTitle>Subscribe to CRM Premium</CardTitle>
                <CardDescription>Choose your subscription duration and payment method</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (Ghana)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="0XXXXXXXXX"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    className={phoneError ? "border-red-500" : ""}
                  />
                  {phoneError && <p className="text-sm text-red-500">{phoneError}</p>}
                  <p className="text-xs text-muted-foreground">
                    Enter a valid Ghanaian phone number for mobile money payment
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="provider">Mobile Money Provider</Label>
                  <Select value={mobileMoneyProvider} onValueChange={setMobileMoneyProvider}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                      <SelectItem value="airtel">AirtelTigo Money</SelectItem>
                      <SelectItem value="vodafone">Telecel Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Label>Subscription Duration</Label>
                    <span className="font-medium">
                      {months} {months === 1 ? "month" : "months"}
                    </span>
                  </div>
                  <Slider
                    defaultValue={[1]}
                    max={24}
                    min={1}
                    step={1}
                    value={[months]}
                    onValueChange={handleMonthsChange}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1 month</span>
                    <span>12 months</span>
                    <span>24 months</span>
                  </div>

                  {/* Add special markers for discounted plans */}
                  <div className="flex justify-between">
                    <div></div>
                    <div
                      className={`text-xs ${months === 12 ? "text-green-600 font-medium" : "text-muted-foreground"}`}
                    >
                      2 months free
                    </div>
                    <div
                      className={`text-xs ${months === 24 ? "text-green-600 font-medium" : "text-muted-foreground"}`}
                    >
                      4 months free
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-muted p-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Cost per month</span>
                    <span>Ghc {costPerMonth.toFixed(2)}</span>
                  </div>

                  {savings > 0 && (
                    <div className="mt-2 flex justify-between text-green-600">
                      <span className="font-medium">You save</span>
                      <span>Ghc {savings.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="mt-2 flex justify-between text-lg font-bold">
                    <span>Total cost</span>
                    <span>Ghc {totalCost.toFixed(2)}</span>
                  </div>

                  {(months === 12 || months === 24) && (
                    <div className="mt-2 text-xs text-green-600">
                      {months === 12
                        ? "Best value: 12-month plan includes 2 months free!"
                        : "Best value: 24-month plan includes 4 months free!"}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handlePayment}
                  disabled={!phoneNumber || !!phoneError || paymentLoading}
                  className="w-full"
                >
                  {paymentLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    "Subscribe Now"
                  )}
                </Button>
              </CardFooter>
            </Card>

            {/* Payment Information section removed as requested */}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
