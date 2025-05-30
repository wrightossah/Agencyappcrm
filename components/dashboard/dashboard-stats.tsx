"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { InsightCard } from "./insight-card"
import { Users, FileText, DollarSign, Calendar } from "lucide-react"

interface DashboardStats {
  totalClients: number
  activePolicies: number
  totalSales: number
  upcomingExpirations: number
}

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()

    // Set up real-time subscriptions for live updates
    const clientsSubscription = supabase
      .channel("clients-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "clients" }, () => fetchDashboardStats())
      .subscribe()

    const policiesSubscription = supabase
      .channel("policies-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "policies" }, () => fetchDashboardStats())
      .subscribe()

    return () => {
      clientsSubscription.unsubscribe()
      policiesSubscription.unsubscribe()
    }
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
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

      // First, get all client IDs for this agent
      const { data: agentClients } = await supabase.from("clients").select("id").eq("created_by", user.id)

      const clientIds = agentClients?.map((c) => c.id) || []

      if (clientIds.length === 0) {
        setStats({
          totalClients: 0,
          activePolicies: 0,
          totalSales: 0,
          upcomingExpirations: 0,
        })
        return
      }

      // Fetch all data in parallel
      const [clientsResult, activePoliciesResult, salesResult, expirationsResult] = await Promise.all([
        // Total clients for current agent
        supabase
          .from("clients")
          .select("id", { count: "exact", head: true })
          .eq("created_by", user.id),

        // Active policies for current agent's clients
        supabase
          .from("policies")
          .select("id", { count: "exact", head: true })
          .eq("status", "Active")
          .in("client_id", clientIds),

        // All policies for sales calculation
        supabase
          .from("policies")
          .select("premium_amount, premium_paid")
          .in("client_id", clientIds),

        // Upcoming expirations (next 30 days for agent's clients)
        supabase
          .from("policies")
          .select("id")
          .eq("status", "Active")
          .gte("end_date", now.toISOString().split("T")[0])
          .lte("end_date", thirtyDaysFromNow.toISOString().split("T")[0])
          .in("client_id", clientIds),
      ])

      // Calculate total sales from all policies
      const allPolicies = salesResult.data || []
      const totalSales = allPolicies.reduce((sum, policy) => {
        // Use premium_amount if available, otherwise fall back to premium_paid
        const premium = policy.premium_amount || policy.premium_paid || 0
        return sum + Number.parseFloat(premium.toString())
      }, 0)

      setStats({
        totalClients: clientsResult.count || 0,
        activePolicies: activePoliciesResult.count || 0,
        totalSales,
        upcomingExpirations: expirationsResult.data?.length || 0,
      })
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      // Set default values on error
      setStats({
        totalClients: 0,
        activePolicies: 0,
        totalSales: 0,
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
      description: "Currently active policies",
      icon: FileText,
      href: "/dashboard/policies",
    },
    {
      title: "Total Sales",
      value: formatCurrency(stats?.totalSales || 0),
      description: "Total premium collected",
      icon: DollarSign,
      href: "/dashboard/analytics",
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
        />
      ))}
    </div>
  )
}
