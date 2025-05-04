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

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<{
    firstName: string
    lastName: string
    company: string
  }>({
    firstName: "",
    lastName: "",
    company: "",
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

  useEffect(() => {
    if (user) {
      fetchDashboardData()
      fetchUserProfile()
    }
  }, [user])

  const fetchUserProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("first_name, last_name, company")
        .eq("id", user.id)
        .single()

      if (error) {
        console.error("Error fetching profile:", error)
        return
      }

      if (data) {
        setUserProfile({
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          company: data.company || "",
        })
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    }
  }

  // Get the first name to display in the welcome message
  const getFirstName = () => {
    // If we have a firstName from the profile, use it
    if (userProfile.firstName) {
      return capitalizeFirstLetter(userProfile.firstName)
    }

    // Otherwise, try to extract from email
    if (user?.email) {
      const emailName = user.email.split("@")[0]
      // Try to extract a name from the email (before any dots or numbers)
      const possibleName = emailName.split(/[.\d]/)[0]
      return capitalizeFirstLetter(possibleName)
    }

    return "" // Return empty string if no name found
  }

  // Helper function to capitalize the first letter of a string
  const capitalizeFirstLetter = (string: string) => {
    if (!string) return ""
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
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

      // Fetch profile data for trial info
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("trial_start_date, trial_end_date, has_active_subscription")
        .eq("id", user?.id)
        .single()

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
      } else if (!profileError && profileData) {
        // Check trial status
        const trialEnd = new Date(profileData.trial_end_date)
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

  const firstName = getFirstName()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{firstName ? `Welcome back, ${firstName}!` : "Dashboard"}</h1>
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

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest client interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <div>
                  <p className="text-sm font-medium">
                    {["Policy renewal for John Doe", "New client: Sarah Smith", "Quote sent to Michael Johnson"][i - 1]}
                  </p>
                  <p className="text-xs text-muted-foreground">{["2 hours ago", "Yesterday", "2 days ago"][i - 1]}</p>
                </div>
              </div>
            ))}
          </div>
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
