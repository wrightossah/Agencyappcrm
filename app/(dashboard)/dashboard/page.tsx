"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"
import { Loader2, Users, FileText, BarChart2, CreditCard, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { capitalizeFirstLetter, formatName } from "@/lib/utils"

// Define types for activities
interface Activity {
  id: string
  type: string
  description: string
  created_at: string
  related_id?: string
  related_name?: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<{
    firstName: string
    lastName: string
    company: string
    fullName: string
  }>({
    firstName: "",
    lastName: "",
    company: "",
    fullName: "",
  })
  const [dashboardData, setDashboardData] = useState({
    clients: {
      total: 0,
      active: 0,
      newThisMonth: 0,
    },
    reports: {
      total: 0,
      recent: [],
    },
    analytics: {
      revenue: 0,
      growth: 0,
    },
    subscription: {
      status: "inactive",
      daysLeft: 0,
      plan: "",
      endDate: null as Date | null,
    },
  })
  const [recentActivities, setRecentActivities] = useState<Activity[]>([])
  const [activitiesLoading, setActivitiesLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
      fetchUserProfile()
      fetchRecentActivities()
    }
  }, [user])

  const fetchUserProfile = async () => {
    if (!user) return

    try {
      // Changed from .single() to handle the case where profile might not exist
      const { data, error } = await supabase
        .from("profiles")
        .select("first_name, last_name, company, full_name")
        .eq("id", user.id)

      if (error) {
        console.error("Error fetching profiles:", error)
        return
      }

      // Check if we have any profile data
      if (data && data.length > 0) {
        // Use the first profile if multiple exist (shouldn't happen with proper constraints)
        const profile = data[0]
        setUserProfile({
          firstName: profile.first_name || "",
          lastName: profile.last_name || "",
          company: profile.company || "",
          fullName: profile.full_name || "",
        })
      } else {
        // No profile found, create one with basic info from auth
        await createUserProfile(user)
      }
    } catch (error) {
      console.error("Error in profile handling:", error)
    }
  }

  // Create a user profile if one doesn't exist
  const createUserProfile = async (user: any) => {
    try {
      // Extract name parts from email if available
      let firstName = ""
      const lastName = ""
      let fullName = ""

      if (user.email) {
        const emailName = user.email.split("@")[0]
        // Try to extract a name from the email (before any dots or numbers)
        firstName = emailName.split(/[.\d]/)[0]
        firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase()
        fullName = firstName
      }

      const { error } = await supabase.from("profiles").insert({
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        full_name: fullName,
        email: user.email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        trial_start_date: new Date().toISOString(),
        trial_end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days trial
      })

      if (error) {
        console.error("Error creating profile:", error)
        return
      }

      // Set the profile in state
      setUserProfile({
        firstName,
        lastName,
        company: "",
        fullName,
      })
    } catch (error) {
      console.error("Error creating user profile:", error)
    }
  }

  // Fetch recent activities from various tables
  const fetchRecentActivities = async () => {
    if (!user) return
    setActivitiesLoading(true)

    try {
      // Fetch recent clients
      const { data: clientsData, error: clientsError } = await supabase
        .from("clients")
        .select("id, name, created_at")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false })
        .limit(5)

      if (clientsError) throw clientsError

      // Fetch recent policies
      const { data: policiesData, error: policiesError } = await supabase
        .from("policies")
        .select("id, policy_type, created_at, client_id, clients(name)")
        .order("created_at", { ascending: false })
        .limit(5)

      if (policiesError) throw policiesError

      // Fetch recent claims (if the table exists)
      let claimsData: any[] = []
      try {
        const { data, error } = await supabase
          .from("claims")
          .select("id, claim_type, created_at, client_id, clients(name)")
          .order("created_at", { ascending: false })
          .limit(5)

        if (!error && data) {
          claimsData = data
        }
      } catch (error) {
        console.log("Claims table might not exist yet:", error)
      }

      // Combine and format activities
      const activities: Activity[] = [
        ...clientsData.map((client) => ({
          id: `client-${client.id}`,
          type: "client",
          description: `New client added: ${client.name}`,
          created_at: client.created_at,
          related_id: client.id,
          related_name: client.name,
        })),
        ...policiesData.map((policy) => ({
          id: `policy-${policy.id}`,
          type: "policy",
          description: `New ${policy.policy_type} policy added for ${policy.clients?.name || "a client"}`,
          created_at: policy.created_at,
          related_id: policy.client_id,
          related_name: policy.clients?.name,
        })),
        ...claimsData.map((claim) => ({
          id: `claim-${claim.id}`,
          type: "claim",
          description: `New ${claim.claim_type} claim filed for ${claim.clients?.name || "a client"}`,
          created_at: claim.created_at,
          related_id: claim.client_id,
          related_name: claim.clients?.name,
        })),
      ]

      // Sort by date (newest first)
      activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      // Take only the 5 most recent
      setRecentActivities(activities.slice(0, 5))
    } catch (error) {
      console.error("Error fetching recent activities:", error)
    } finally {
      setActivitiesLoading(false)
    }
  }

  // Format relative time for activities
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return "Just now"
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} hour${hours > 1 ? "s" : ""} ago`
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} day${days > 1 ? "s" : ""} ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch clients data
      const { data: clientsData, error: clientsError } = await supabase
        .from("clients")
        .select("*")
        .eq("created_by", user?.id)

      if (clientsError) throw clientsError

      // Fetch subscription data
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(1)

      if (subscriptionError) throw subscriptionError

      // Fetch profile data for trial info - also changed from .single()
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("trial_start_date, trial_end_date, has_active_subscription")
        .eq("id", user?.id)

      // Calculate subscription status
      let subscriptionStatus = "inactive"
      let daysLeft = 0
      let plan = ""
      let endDate = null

      if (subscriptionData && subscriptionData.length > 0) {
        const subscription = subscriptionData[0]
        const subEndDate = new Date(subscription.end_date)
        const today = new Date()

        if (subEndDate > today) {
          subscriptionStatus = "active"
          daysLeft = Math.ceil((subEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          plan = subscription.plan_name || `${subscription.duration_months} Month Plan`
          endDate = subEndDate
        }
      } else if (!profileError && profileData && profileData.length > 0) {
        // Check trial status
        const profile = profileData[0]
        const trialEnd = new Date(profile.trial_end_date)
        const today = new Date()

        if (trialEnd > today) {
          subscriptionStatus = "trial"
          daysLeft = Math.ceil((trialEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          plan = "Free Trial"
          endDate = trialEnd
        }
      }

      // Update dashboard data
      setDashboardData({
        clients: {
          total: clientsData?.length || 0,
          active: clientsData?.filter((client) => client.status === "active").length || 0,
          newThisMonth:
            clientsData?.filter((client) => {
              const createdAt = new Date(client.created_at)
              const now = new Date()
              return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear()
            }).length || 0,
        },
        reports: {
          total: 4, // Placeholder
          recent: [
            { name: "Monthly Summary", date: "April 5, 2025" },
            { name: "Client Acquisition", date: "April 3, 2025" },
          ],
        },
        analytics: {
          revenue: 12234,
          growth: 8,
        },
        subscription: {
          status: subscriptionStatus,
          daysLeft,
          plan,
          endDate,
        },
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Use the FName function to get the first name for the welcome message
  // Format the full name with proper capitalization
  const getDisplayName = () => {
    // If we have first and last name, format them
    if (userProfile.firstName || userProfile.lastName) {
      return formatName(userProfile.firstName, userProfile.lastName)
    }

    // If we have a full name, use it
    if (userProfile.fullName) {
      return userProfile.fullName.split(" ").map(capitalizeFirstLetter).join(" ")
    }

    // If we have an email but no name
    if (user?.email) {
      const emailName = user.email.split("@")[0]
      return capitalizeFirstLetter(emailName)
    }

    // Fallback
    return ""
  }

  const displayName = getDisplayName()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {displayName ? `Welcome back, ${displayName}!` : "Welcome back!"}
        </h1>
        <p className="text-muted-foreground">Here's an overview of your Agencyapp</p>
      </div>

      {/* Dashboard Overview Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.clients.total}</div>
            <p className="text-xs text-muted-foreground">{dashboardData.clients.newThisMonth} new this month</p>
            <div className="mt-4">
              <Button variant="outline" size="sm" className="w-full" onClick={() => router.push("/dashboard/clients")}>
                View Clients
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.reports.total}</div>
            <p className="text-xs text-muted-foreground">
              Last updated: {dashboardData.reports.recent[0]?.date || "N/A"}
            </p>
            <div className="mt-4">
              <Button variant="outline" size="sm" className="w-full" onClick={() => router.push("/dashboard/reports")}>
                View Reports
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Analytics</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Ghc {dashboardData.analytics.revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+{dashboardData.analytics.growth}% from last month</p>
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => router.push("/dashboard/analytics")}
              >
                View Analytics
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Subscription</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-md font-bold capitalize">{dashboardData.subscription.status}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.subscription.status !== "inactive"
                ? `${dashboardData.subscription.daysLeft} days left on ${dashboardData.subscription.plan}`
                : "No active subscription"}
            </p>
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => router.push("/dashboard/subscription")}
              >
                Manage Subscription
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Alert */}
      {dashboardData.subscription.status === "trial" && dashboardData.subscription.daysLeft <= 3 && (
        <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800">
          <AlertCircle className="h-4 w-4 text-yellow-800" />
          <AlertDescription>
            Your free trial ends in <strong>{dashboardData.subscription.daysLeft} days</strong>.
            <Link href="/dashboard/subscription" className="ml-1 underline">
              Subscribe now
            </Link>{" "}
            to avoid interruption.
          </AlertDescription>
        </Alert>
      )}

      {/* Recent Activity - Updated with real data */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest client interactions and updates</CardDescription>
        </CardHeader>
        <CardContent>
          {activitiesLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : recentActivities.length > 0 ? (
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div
                    className={`h-2 w-2 rounded-full ${
                      activity.type === "client"
                        ? "bg-green-500"
                        : activity.type === "policy"
                          ? "bg-blue-500"
                          : activity.type === "claim"
                            ? "bg-orange-500"
                            : "bg-primary"
                    }`}
                  ></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{getRelativeTime(activity.created_at)}</p>
                  </div>
                  {activity.related_id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (activity.type === "client") {
                          router.push(`/dashboard/clients/${activity.related_id}`)
                        }
                      }}
                    >
                      View
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <p>No recent activity found</p>
              <p className="text-sm mt-2">Start by adding clients or policies to see activity here</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks you can perform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center justify-center gap-2"
              onClick={() => router.push("/dashboard/clients")}
            >
              <Users className="h-5 w-5" />
              <span>Add Client</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center justify-center gap-2"
              onClick={() => router.push("/dashboard/reports")}
            >
              <FileText className="h-5 w-5" />
              <span>Generate Report</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center justify-center gap-2"
              onClick={() => router.push("/dashboard/analytics")}
            >
              <BarChart2 className="h-5 w-5" />
              <span>View Analytics</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center justify-center gap-2"
              onClick={() => router.push("/dashboard/subscription")}
            >
              <CreditCard className="h-5 w-5" />
              <span>Manage Subscription</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
