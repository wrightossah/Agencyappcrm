"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { InsightCard } from "./insight-card"
import { Users, FileText, DollarSign } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

interface DashboardStats {
  totalClients: number
  activePolicies: number
  totalSales: number
}

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
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
    }
  }, [user])

  const fetchDashboardStats = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Fetch all data in parallel
      const [clientsResult, policiesResult] = await Promise.all([
        // Total clients for current agent
        supabase
          .from("clients")
          .select("id", { count: "exact", head: true })
          .eq("created_by", user.id),

        // All policies for current agent's clients to calculate sales and active count
        supabase
          .from("policies")
          .select("premium_paid, premium_amount, status, active")
          .eq("created_by", user.id),
      ])

      const policies = policiesResult.data || []

      // Calculate active policies
      const activePolicies = policies.filter((policy) => policy.status === "Active" || policy.active === true).length

      // Calculate total sales
      const totalSales = policies.reduce((sum, policy) => {
        const premium = Number.parseFloat(policy.premium_paid || policy.premium_amount || "0")
        return sum + premium
      }, 0)

      setStats({
        totalClients: clientsResult.count || 0,
        activePolicies,
        totalSales,
      })
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      setStats({
        totalClients: 0,
        activePolicies: 0,
        totalSales: 0,
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
      clickable: true,
    },
    {
      title: "Total Sales",
      value: formatCurrency(stats?.totalSales || 0),
      description: "Total premium collected",
      icon: DollarSign,
      href: "/dashboard/analytics",
      clickable: true,
    },
    {
      title: "Active Policies",
      value: stats?.activePolicies || 0,
      description: "Currently active policies",
      icon: FileText,
      href: null,
      clickable: false,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {insightCards.map((card, index) => (
        <InsightCard
          key={index}
          title={card.title}
          value={card.value}
          description={card.description}
          icon={card.icon}
          href={card.href}
          clickable={card.clickable}
          loading={loading}
        />
      ))}
    </div>
  )
}
