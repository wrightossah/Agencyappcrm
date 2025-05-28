"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, Target, TrendingUp, DollarSign } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"
import { format, startOfDay, startOfWeek, startOfMonth, endOfDay, endOfWeek, endOfMonth } from "date-fns"

interface SalesData {
  totalSales: number
  totalRevenue: number
  goalAmount: number
  goalProgress: number
  periodLabel: string
}

export function SalesTracker() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("monthly")
  const [salesData, setSalesData] = useState<SalesData>({
    totalSales: 0,
    totalRevenue: 0,
    goalAmount: 0,
    goalProgress: 0,
    periodLabel: "",
  })
  const [loading, setLoading] = useState(true)

  // Sales goals (these could be stored in database later)
  const salesGoals = {
    daily: 5000, // Ghc 5,000 daily goal
    weekly: 25000, // Ghc 25,000 weekly goal
    monthly: 100000, // Ghc 100,000 monthly goal
  }

  useEffect(() => {
    if (user) {
      fetchSalesData(activeTab)
    }
  }, [user, activeTab])

  const fetchSalesData = async (period: string) => {
    if (!user) return

    setLoading(true)
    try {
      const now = new Date()
      let startDate: Date
      let endDate: Date
      let goalAmount: number
      let periodLabel: string

      // Set date ranges based on period
      switch (period) {
        case "daily":
          startDate = startOfDay(now)
          endDate = endOfDay(now)
          goalAmount = salesGoals.daily
          periodLabel = format(now, "MMMM d, yyyy")
          break
        case "weekly":
          startDate = startOfWeek(now)
          endDate = endOfWeek(now)
          goalAmount = salesGoals.weekly
          periodLabel = `Week of ${format(startDate, "MMM d")}`
          break
        case "monthly":
        default:
          startDate = startOfMonth(now)
          endDate = endOfMonth(now)
          goalAmount = salesGoals.monthly
          periodLabel = format(now, "MMMM yyyy")
          break
      }

      // Fetch policies within the date range
      const { data: policies, error } = await supabase
        .from("policies")
        .select(`
          premium_paid,
          premium_amount,
          created_at,
          clients!inner(created_by)
        `)
        .eq("clients.created_by", user.id)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())

      if (error) throw error

      // Calculate totals
      const totalSales = policies?.length || 0
      const totalRevenue =
        policies?.reduce((sum, policy) => {
          const premium = Number.parseFloat(policy.premium_paid || policy.premium_amount || 0)
          return sum + premium
        }, 0) || 0

      const goalProgress = Math.min((totalRevenue / goalAmount) * 100, 100)

      setSalesData({
        totalSales,
        totalRevenue,
        goalAmount,
        goalProgress,
        periodLabel,
      })
    } catch (error) {
      console.error("Error fetching sales data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `Ghc ${amount.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-green-500"
    if (progress >= 75) return "bg-blue-500"
    if (progress >= 50) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getStatusBadge = (progress: number) => {
    if (progress >= 100) return <Badge className="bg-green-100 text-green-800">Goal Achieved!</Badge>
    if (progress >= 75) return <Badge className="bg-blue-100 text-blue-800">On Track</Badge>
    if (progress >= 50) return <Badge className="bg-yellow-100 text-yellow-800">Behind Target</Badge>
    return <Badge className="bg-red-100 text-red-800">Needs Attention</Badge>
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Sales Tracker
            </CardTitle>
            <CardDescription>Track your progress toward sales goals</CardDescription>
          </div>
          {getStatusBadge(salesData.goalProgress)}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6 mt-6">
            {/* Period Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{salesData.periodLabel}</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => fetchSalesData(activeTab)} disabled={loading}>
                Refresh
              </Button>
            </div>

            {/* Progress Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Progress to Goal</span>
                <span className="text-sm text-muted-foreground">{salesData.goalProgress.toFixed(1)}%</span>
              </div>

              <Progress
                value={salesData.goalProgress}
                className="h-3"
                style={{
                  background: `linear-gradient(to right, ${getProgressColor(salesData.goalProgress)} 0%, ${getProgressColor(salesData.goalProgress)} ${salesData.goalProgress}%, #e5e7eb ${salesData.goalProgress}%, #e5e7eb 100%)`,
                }}
              />

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {formatCurrency(salesData.totalRevenue)} of {formatCurrency(salesData.goalAmount)}
                </span>
                <span className="text-muted-foreground">
                  {formatCurrency(salesData.goalAmount - salesData.totalRevenue)} remaining
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Total Sales</span>
                </div>
                <p className="text-2xl font-bold mt-2">{salesData.totalSales}</p>
                <p className="text-xs text-muted-foreground">Policies sold</p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Revenue</span>
                </div>
                <p className="text-2xl font-bold mt-2">{formatCurrency(salesData.totalRevenue)}</p>
                <p className="text-xs text-muted-foreground">Total earned</p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Goal</span>
                </div>
                <p className="text-2xl font-bold mt-2">{formatCurrency(salesData.goalAmount)}</p>
                <p className="text-xs text-muted-foreground">Target amount</p>
              </div>
            </div>

            {/* Achievement Message */}
            {salesData.goalProgress >= 100 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">Congratulations!</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  You've achieved your {activeTab} sales goal. Keep up the excellent work!
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
