"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Download, FileText, Moon, Sun, CalendarIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useTheme } from "next-themes"
import { supabase } from "@/lib/supabase"
import { SalesPerformanceChart, CommissionBreakdownChart, PolicyDistributionChart, ClientActivityChart } from "./charts"
import type { DateRange } from "react-day-picker"
import { format, subMonths } from "date-fns"
import { exportToCSV, exportToPDF } from "./export-utils"

export default function AnalyticsPage() {
  // Theme state
  const { theme, setTheme } = useTheme()

  // Filter states
  const [date, setDate] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 6),
    to: new Date(),
  })
  const [policyType, setPolicyType] = useState<string>("all")

  // Data states
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [salesData, setSalesData] = useState([])
  const [commissionData, setCommissionData] = useState([])
  const [policyDistData, setPolicyDistData] = useState([])
  const [clientActivityData, setClientActivityData] = useState([])

  // Fetch data based on filters
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        // Format dates for queries
        const fromDate = date?.from ? format(date.from, "yyyy-MM-dd") : null
        const toDate = date?.to ? format(date.to, "yyyy-MM-dd") : null

        // Sales Performance Data
        const { data: salesResult, error: salesError } = await fetchSalesData(fromDate, toDate, policyType)
        if (salesError) throw new Error(salesError.message)
        setSalesData(salesResult || [])

        // Commission Data
        const { data: commissionResult, error: commissionError } = await fetchCommissionData(
          fromDate,
          toDate,
          policyType,
        )
        if (commissionError) throw new Error(commissionError.message)
        setCommissionData(commissionResult || [])

        // Policy Distribution Data
        const { data: policyResult, error: policyError } = await fetchPolicyDistribution(fromDate, toDate, policyType)
        if (policyError) throw new Error(policyError.message)
        setPolicyDistData(policyResult || [])

        // Client Activity Data
        const { data: clientResult, error: clientError } = await fetchClientActivity(fromDate, toDate, policyType)
        if (clientError) throw new Error(clientError.message)
        setClientActivityData(clientResult || [])
      } catch (err) {
        console.error("Error fetching analytics data:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [date, policyType])

  // Handle exports
  const handleExportCSV = () => {
    exportToCSV(
      {
        salesData,
        commissionData,
        policyDistData,
        clientActivityData,
      },
      date,
    )
  }

  const handleExportPDF = () => {
    exportToPDF(
      {
        salesData,
        commissionData,
        policyDistData,
        clientActivityData,
      },
      date,
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">View performance metrics and business insights</p>
        </div>

        <div className="flex items-center space-x-2">
          <Sun className="h-4 w-4" />
          <Switch checked={theme === "dark"} onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")} />
          <Moon className="h-4 w-4" />
        </div>
      </div>

      {/* Filters Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 md:items-end">
            <div className="space-y-2 flex-1">
              <Label htmlFor="date-range">Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button id="date-range" variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "MMM d, yyyy")} - {format(date.to, "MMM d, yyyy")}
                        </>
                      ) : (
                        format(date.from, "MMM d, yyyy")
                      )
                    ) : (
                      <span>Select date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2 flex-1">
              <Label htmlFor="policy-type">Policy Type</Label>
              <Select defaultValue="all" onValueChange={setPolicyType} value={policyType}>
                <SelectTrigger id="policy-type">
                  <SelectValue placeholder="Select policy type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Policies</SelectItem>
                  <SelectItem value="Motor">Motor</SelectItem>
                  <SelectItem value="Travel">Travel</SelectItem>
                  <SelectItem value="GIT">GIT</SelectItem>
                  <SelectItem value="Marine">Marine</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-x-2 flex-1 md:text-right">
              <Button variant="outline" onClick={handleExportCSV}>
                <FileText className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button variant="default" onClick={handleExportPDF}>
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Chart Tabs */}
      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="sales">Sales Performance</TabsTrigger>
          <TabsTrigger value="commission">Commission Breakdown</TabsTrigger>
          <TabsTrigger value="distribution">Policy Distribution</TabsTrigger>
          <TabsTrigger value="activity">Client Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Performance</CardTitle>
              <CardDescription>Monthly sales and revenue trends</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : (
                <SalesPerformanceChart data={salesData} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commission" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Commission Breakdown</CardTitle>
              <CardDescription>Commissions by policy type</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : (
                <CommissionBreakdownChart data={commissionData} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Policy Distribution</CardTitle>
              <CardDescription>Breakdown of policy types</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : (
                <PolicyDistributionChart data={policyDistData} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Client Activity</CardTitle>
              <CardDescription>Active vs. Inactive clients</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : (
                <ClientActivityChart data={clientActivityData} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Revenue" value={formatCurrency(calculateTotalRevenue(salesData))} loading={loading} />
        <MetricCard
          title="Total Commissions"
          value={formatCurrency(calculateTotalCommissions(commissionData))}
          loading={loading}
        />
        <MetricCard title="Active Policies" value={calculateActivePolicies(policyDistData)} loading={loading} />
        <MetricCard title="Active Clients" value={calculateActiveClients(clientActivityData)} loading={loading} />
      </div>
    </div>
  )
}

// Helper Functions
function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

function calculateTotalRevenue(data: any[]) {
  return data.reduce((sum, item) => sum + (item.revenue || 0), 0)
}

function calculateTotalCommissions(data: any[]) {
  return data.reduce((sum, item) => sum + (item.commission || 0), 0)
}

function calculateActivePolicies(data: any[]) {
  return data.reduce((sum, item) => sum + (item.value || 0), 0)
}

function calculateActiveClients(data: any[]) {
  return data.find((item) => item.name === "Active")?.value || 0
}

// Metric Card Component
function MetricCard({ title, value, loading }: { title: string; value: string | number; loading: boolean }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-8 w-[100px]" /> : <div className="text-2xl font-bold">{value}</div>}
      </CardContent>
    </Card>
  )
}

// Supabase Query Functions
async function fetchSalesData(fromDate: string | null, toDate: string | null, policyType: string) {
  let query = supabase.from("policies").select(`
      created_at,
      premium,
      policy_type
    `)

  if (fromDate) {
    query = query.gte("created_at", fromDate)
  }

  if (toDate) {
    query = query.lte("created_at", toDate)
  }

  if (policyType !== "all") {
    query = query.eq("policy_type", policyType)
  }

  const { data, error } = await query

  if (error) {
    return { data: null, error }
  }

  // Process data to group by month
  const monthlyData = data.reduce((acc: any, policy: any) => {
    const month = format(new Date(policy.created_at), "MMM yyyy")

    if (!acc[month]) {
      acc[month] = { month, sales: 0, revenue: 0 }
    }

    acc[month].sales += 1
    acc[month].revenue += Number.parseFloat(policy.premium)

    return acc
  }, {})

  return { data: Object.values(monthlyData), error: null }
}

async function fetchCommissionData(fromDate: string | null, toDate: string | null, policyType: string) {
  let query = supabase.from("policies").select(`
      policy_type,
      premium,
      commission_rate
    `)

  if (fromDate) {
    query = query.gte("created_at", fromDate)
  }

  if (toDate) {
    query = query.lte("created_at", toDate)
  }

  if (policyType !== "all") {
    query = query.eq("policy_type", policyType)
  }

  const { data, error } = await query

  if (error) {
    return { data: null, error }
  }

  // Process data to group by policy type
  const commissionByType = data.reduce((acc: any, policy: any) => {
    const type = policy.policy_type

    if (!acc[type]) {
      acc[type] = { name: type, premium: 0, commission: 0 }
    }

    const premium = Number.parseFloat(policy.premium)
    const commissionRate = Number.parseFloat(policy.commission_rate || 0.1) // Default 10% if not specified

    acc[type].premium += premium
    acc[type].commission += premium * commissionRate

    return acc
  }, {})

  return { data: Object.values(commissionByType), error: null }
}

async function fetchPolicyDistribution(fromDate: string | null, toDate: string | null, policyType: string) {
  let query = supabase
    .from("policies")
    .select(`
      policy_type,
      count
    `)
    .select()

  if (fromDate) {
    query = query.gte("created_at", fromDate)
  }

  if (toDate) {
    query = query.lte("created_at", toDate)
  }

  if (policyType !== "all") {
    query = query.eq("policy_type", policyType)
  }

  const { data, error } = await query

  if (error) {
    return { data: null, error }
  }

  // Count policies by type
  const policyTypes = data.reduce((acc: any, policy: any) => {
    const type = policy.policy_type

    if (!acc[type]) {
      acc[type] = { name: type, value: 0 }
    }

    acc[type].value += 1

    return acc
  }, {})

  return { data: Object.values(policyTypes), error: null }
}

async function fetchClientActivity(fromDate: string | null, toDate: string | null, policyType: string) {
  let query = supabase.from("clients").select(`
      id,
      active,
      policies (
        policy_type
      )
    `)

  if (fromDate) {
    query = query.gte("created_at", fromDate)
  }

  if (toDate) {
    query = query.lte("created_at", toDate)
  }

  const { data, error } = await query

  if (error) {
    return { data: null, error }
  }

  // Filter by policy type if needed
  let filteredData = data
  if (policyType !== "all") {
    filteredData = data.filter(
      (client) => client.policies && client.policies.some((policy: any) => policy.policy_type === policyType),
    )
  }

  // Count active vs inactive
  const activeCount = filteredData.filter((client) => client.active).length
  const inactiveCount = filteredData.length - activeCount

  return {
    data: [
      { name: "Active", value: activeCount },
      { name: "Inactive", value: inactiveCount },
    ],
    error: null,
  }
}
