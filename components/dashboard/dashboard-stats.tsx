"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { InsightCard } from "./insight-card"
import { Users, FileText, DollarSign, BarChart3, Mail, MessageSquare, Bell, Calendar } from "lucide-react"

interface DashboardStats {
  totalClients: number
  activePolicies: number
  expiredPolicies: number
  totalSales: number
  monthlySales: number
  emailsSent: number
  smsSent: number
  remindersSent: number
  upcomingExpirations: number
}

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Get current date for calculations
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

      // Fetch all data in parallel
      const [
        clientsResult,
        policiesResult,
        salesResult,
        monthlySalesResult,
        emailsResult,
        smsResult,
        expirationsResult,
      ] = await Promise.all([
        // Total clients for current agent
        supabase
          .from("clients")
          .select("id", { count: "exact", head: true })
          .eq("agent_id", user.id),

        // Policies for current agent (active vs expired)
        supabase
          .from("policies")
          .select("status, end_date, client_id")
          .in(
            "client_id",
            (await supabase.from("clients").select("id").eq("agent_id", user.id)).data?.map((c) => c.id) || [],
          ),

        // Total sales (sum of all premiums for agent's clients)
        supabase
          .from("policies")
          .select("premium, client_id")
          .in(
            "client_id",
            (await supabase.from("clients").select("id").eq("agent_id", user.id)).data?.map((c) => c.id) || [],
          ),

        // Monthly sales (this month for agent's clients)
        supabase
          .from("policies")
          .select("premium, created_at, client_id")
          .gte("created_at", firstDayOfMonth.toISOString())
          .in(
            "client_id",
            (await supabase.from("clients").select("id").eq("agent_id", user.id)).data?.map((c) => c.id) || [],
          ),

        // Emails sent by current agent
        supabase
          .from("email_logs")
          .select("id", { count: "exact", head: true })
          .eq("agent_id", user.id)
          .catch(() => ({ count: 0 })),

        // SMS sent by current agent
        supabase
          .from("sms_logs")
          .select("id", { count: "exact", head: true })
          .eq("agent_id", user.id)
          .catch(() => ({ count: 0 })),

        // Upcoming expirations (next 30 days for agent's clients)
        supabase
          .from("policies")
          .select("id, client_id")
          .eq("status", "Active")
          .gte("end_date", now.toISOString().split("T")[0])
          .lte("end_date", thirtyDaysFromNow.toISOString().split("T")[0])
          .in(
            "client_id",
            (await supabase.from("clients").select("id").eq("agent_id", user.id)).data?.map((c) => c.id) || [],
          ),
      ])

      // Process policies data
      const policies = policiesResult.data || []
      const activePolicies = policies.filter((p) => p.status === "Active").length
      const expiredPolicies = policies.filter((p) => {
        if (p.status === "Expired") return true
        if (p.end_date && new Date(p.end_date) < now) return true
        return false
      }).length

      // Calculate sales
      const allPolicies = salesResult.data || []
      const totalSales = allPolicies.reduce((sum, policy) => {
        return sum + (Number.parseFloat(policy.premium) || 0)
      }, 0)

      const monthlyPolicies = monthlySalesResult.data || []
      const monthlySales = monthlyPolicies.reduce((sum, policy) => {
        return sum + (Number.parseFloat(policy.premium) || 0)
      }, 0)

      setStats({
        totalClients: clientsResult.count || 0,
        activePolicies,
        expiredPolicies,
        totalSales,
        monthlySales,
        emailsSent: emailsResult.count || 0,
        smsSent: smsResult.count || 0,
        remindersSent: (emailsResult.count || 0) + (smsResult.count || 0),
        upcomingExpirations: expirationsResult.data?.length || 0,
      })
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      // Set default values on error
      setStats({
        totalClients: 0,
        activePolicies: 0,
        expiredPolicies: 0,
        totalSales: 0,
        monthlySales: 0,
        emailsSent: 0,
        smsSent: 0,
        remindersSent: 0,
        upcomingExpirations: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace("GHS", "₵")
  }

  const insightCards = [
    {
      title: "Total Clients",
      value: stats?.totalClients || 0,
      description: "Registered clients",
      icon: Users,
      href: "/dashboard/clients",
    },
    {
      title: "Active Policies",
      value: stats?.activePolicies || 0,
      description: `${stats?.expiredPolicies || 0} expired`,
      icon: FileText,
      href: "/dashboard/policies",
    },
    {
      title: "Total Sales",
      value: formatCurrency(stats?.totalSales || 0),
      description: `${formatCurrency(stats?.monthlySales || 0)} this month`,
      icon: DollarSign,
      href: "/dashboard/analytics",
      trend:
        stats?.monthlySales && stats?.totalSales
          ? {
              value: Math.round((stats.monthlySales / (stats.totalSales / 12)) * 100 - 100),
              isPositive: stats.monthlySales > stats.totalSales / 12,
            }
          : undefined,
    },
    {
      title: "Analytics",
      value: "View Reports",
      description: "Performance insights",
      icon: BarChart3,
      href: "/dashboard/analytics",
    },
    {
      title: "Emails Sent",
      value: stats?.emailsSent || 0,
      description: "Total email communications",
      icon: Mail,
      href: "/dashboard/settings",
    },
    {
      title: "SMS Sent",
      value: stats?.smsSent || 0,
      description: "Total SMS communications",
      icon: MessageSquare,
      href: "/dashboard/settings",
    },
    {
      title: "Reminders Sent",
      value: stats?.remindersSent || 0,
      description: "Email + SMS reminders",
      icon: Bell,
      href: "/dashboard/settings",
    },
    {
      title: "Upcoming Expirations",
      value: stats?.upcomingExpirations || 0,
      description: "Expiring in 30 days",
      icon: Calendar,
      href: "/dashboard/clients",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {insightCards.map((card, index) => (
        <InsightCard
          key={index}
          title={card.title}
          value={card.value}
          description={card.description}
          icon={card.icon}
          href={card.href}
          loading={loading}
          trend={card.trend}
        />
      ))}
    </div>
  )
}
