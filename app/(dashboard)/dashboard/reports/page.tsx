"use client"

import { useState, useEffect } from "react"
import { ReportFilters } from "@/components/reports/report-filters"
import { ReportContent } from "@/components/reports/report-content"
import { ClientReport } from "@/app/(dashboard)/dashboard/clients/client-report"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, UserRound } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import type { ReportType, TimeFrame, ChartData } from "@/lib/types"
import { exportToCSV, exportToPDF, prepareReportData } from "@/lib/export-utils"
import { toast } from "@/components/ui/use-toast"
import { generateDateLabels } from "@/lib/mock-data"

interface Client {
  id: string
  name: string
  email: string
  address: string
  phone: string
  phone_number: string
  created_at?: string
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("policy-summary")
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("monthly")
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  })
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isClientReportOpen, setIsClientReportOpen] = useState(false)
  const [metrics, setMetrics] = useState<any[]>([])
  const [charts, setCharts] = useState<any>({})
  const [tables, setTables] = useState<any>({})

  // Fetch clients on component mount
  useEffect(() => {
    fetchClients()
    fetchReportData()
  }, [reportType, timeFrame])

  // Filter clients when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredClients([])
    } else {
      const filtered = clients.filter(
        (client) =>
          (client.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
          (client.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()),
      )
      setFilteredClients(filtered)
    }
  }, [searchQuery, clients])

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase.from("clients").select("*").order("name", { ascending: true })

      if (error) throw error

      setClients(data || [])
    } catch (error: any) {
      console.error("Error fetching clients:", error.message)
      toast({
        title: "Error",
        description: "Failed to load clients. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Helper function to create chart data
  const createChartData = (labels: string[], data: number[], label: string): ChartData => {
    return {
      labels,
      datasets: [
        {
          label,
          data,
          borderColor: "hsl(var(--primary))",
          backgroundColor: "rgba(var(--primary), 0.1)",
          borderWidth: 2,
          fill: true,
        },
      ],
    }
  }

  // Helper function to create pie chart data
  const createPieChartData = (labels: string[], data: number[], label: string): ChartData => {
    return {
      labels,
      datasets: [
        {
          label,
          data,
          backgroundColor: [
            "rgba(255, 99, 132, 0.7)",
            "rgba(54, 162, 235, 0.7)",
            "rgba(255, 206, 86, 0.7)",
            "rgba(75, 192, 192, 0.7)",
            "rgba(153, 102, 255, 0.7)",
          ],
          borderWidth: 1,
        },
      ],
    }
  }

  const fetchReportData = async () => {
    setIsLoading(true)

    try {
      // Fetch real data from Supabase based on report type
      let newMetrics: any[] = []
      const newCharts: any = {}
      let newTables: any = {}

      switch (reportType) {
        case "policy-summary":
          // Fetch policy metrics
          const { data: policiesData, error: policiesError } = await supabase.from("policies").select("*")

          if (policiesError) throw policiesError

          if (policiesData) {
            const totalPolicies = policiesData.length
            const activePolicies = policiesData.filter((p) => new Date(p.expiry_date) > new Date()).length

            const newPolicies = policiesData.filter((p) => {
              const createdDate = new Date(p.created_at || "")
              const thirtyDaysAgo = new Date()
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
              return createdDate > thirtyDaysAgo
            }).length

            // Calculate average premium
            let totalPremium = 0
            policiesData.forEach((p) => {
              totalPremium += p.premium_paid || 0
            })
            const avgPremium = totalPolicies > 0 ? totalPremium / totalPolicies : 0

            newMetrics = [
              { title: "Total Policies", value: totalPolicies, description: "All policies" },
              { title: "Active Policies", value: activePolicies, description: "Current policies" },
              { title: "New Policies", value: newPolicies, description: "Last 30 days" },
              { title: "Avg. Premium", value: `Ghc ${avgPremium.toFixed(2)}`, description: "Per policy" },
            ]

            // Create policy trend chart data
            const timeLabels = generateDateLabels(
              timeFrame === "daily" ? 14 : timeFrame === "weekly" ? 8 : 6,
              timeFrame,
            )

            // Create dummy trend data for now (in a real app, you'd query historical data)
            const trendData = Array(timeLabels.length)
              .fill(0)
              .map((_, i) => {
                return Math.floor(Math.random() * 20) + 5
              })

            newCharts["Policy Trend"] = createChartData(timeLabels, trendData, "Policies")

            // Create policy type breakdown
            const policyTypes = [...new Set(policiesData.map((p) => p.policy_type))]
            const policyTypeCounts = policyTypes.map(
              (type) => policiesData.filter((p) => p.policy_type === type).length,
            )

            newCharts["Policy Type Breakdown"] = createPieChartData(policyTypes, policyTypeCounts, "Policies by Type")

            // Create policy table data
            const policyTableRows = policyTypes.map((type) => {
              const typePolicies = policiesData.filter((p) => p.policy_type === type)
              const typeTotal = typePolicies.length
              const typeNew = typePolicies.filter((p) => {
                const createdDate = new Date(p.created_at || "")
                const thirtyDaysAgo = new Date()
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
                return createdDate > thirtyDaysAgo
              }).length

              let typePremium = 0
              typePolicies.forEach((p) => {
                typePremium += p.premium_paid || 0
              })
              const typeAvgPremium = typeTotal > 0 ? typePremium / typeTotal : 0

              return [
                type,
                typeTotal,
                typeNew,
                0, // Renewals - would need additional data
                `Ghc ${typeAvgPremium.toFixed(2)}`,
              ]
            })

            newTables = {
              "Policy Details": {
                headers: ["Policy Type", "Total Policies", "New Policies", "Renewals", "Avg. Premium"],
                rows: policyTableRows,
              },
            }
          }
          break

        case "client-acquisition":
          // Fetch client metrics
          const { data: clientsData, error: clientsError } = await supabase.from("clients").select("*")

          if (clientsError) throw clientsError

          if (clientsData) {
            const totalClients = clientsData.length

            const newClients = clientsData.filter((c) => {
              const createdDate = new Date(c.created_at || "")
              const thirtyDaysAgo = new Date()
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
              return createdDate > thirtyDaysAgo
            }).length

            newMetrics = [
              { title: "Total Clients", value: totalClients, description: "All clients" },
              { title: "New Clients", value: newClients, description: "Last 30 days" },
              { title: "Active Clients", value: totalClients - 0, description: "With active policies" },
              { title: "Avg. Policies", value: "1.2", description: "Per client" },
            ]

            // Create client acquisition trend chart
            const timeLabels = generateDateLabels(
              timeFrame === "daily" ? 14 : timeFrame === "weekly" ? 8 : 6,
              timeFrame,
            )

            // Create dummy trend data for now (in a real app, you'd query historical data)
            const trendData = Array(timeLabels.length)
              .fill(0)
              .map((_, i) => {
                return Math.floor(Math.random() * 10) + 1
              })

            newCharts["Client Acquisition Trend"] = createChartData(timeLabels, trendData, "New Clients")

            // Create client source breakdown (dummy data for now)
            const sources = ["Referral", "Social Media", "Direct", "Website", "Other"]
            const sourceCounts = sources.map(() => Math.floor(Math.random() * 30) + 5)

            newCharts["Client Source Breakdown"] = createPieChartData(sources, sourceCounts, "Clients by Source")

            // Create client table data
            const clientTableRows = sources.map((source, index) => {
              return [
                source,
                sourceCounts[index],
                `${Math.floor(Math.random() * 30) + 40}%`,
                `Ghc ${(Math.random() * 1000 + 500).toFixed(2)}`,
              ]
            })

            newTables = {
              "Client Acquisition Details": {
                headers: ["Source", "New Clients", "Conversion Rate", "Avg. First Policy Value"],
                rows: clientTableRows,
              },
            }
          }
          break

        case "revenue-analysis":
          // Fetch revenue metrics
          const { data: revenuePolicies, error: revenueError } = await supabase.from("policies").select("*")

          if (revenueError) throw revenueError

          if (revenuePolicies) {
            let totalRevenue = 0
            revenuePolicies.forEach((p) => {
              totalRevenue += p.premium_paid || 0
            })

            const newPoliciesRevenue = revenuePolicies
              .filter((p) => {
                const createdDate = new Date(p.created_at || "")
                const thirtyDaysAgo = new Date()
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
                return createdDate > thirtyDaysAgo
              })
              .reduce((sum, p) => sum + (p.premium_paid || 0), 0)

            newMetrics = [
              { title: "Total Revenue", value: `Ghc ${totalRevenue.toFixed(2)}`, description: "All policies" },
              { title: "New Policies", value: `Ghc ${newPoliciesRevenue.toFixed(2)}`, description: "Last 30 days" },
              {
                title: "Avg. Policy Value",
                value: `Ghc ${(totalRevenue / (revenuePolicies.length || 1)).toFixed(2)}`,
                description: "Per policy",
              },
              { title: "Monthly Growth", value: "N/A", description: "Requires historical data" },
            ]

            // Create revenue trend chart
            const timeLabels = generateDateLabels(
              timeFrame === "daily" ? 14 : timeFrame === "weekly" ? 8 : 6,
              timeFrame,
            )

            // Create dummy trend data for now (in a real app, you'd query historical data)
            const trendData = Array(timeLabels.length)
              .fill(0)
              .map((_, i) => {
                return Math.floor(Math.random() * 10000) + 5000
              })

            newCharts["Revenue Trend"] = createChartData(timeLabels, trendData, "Revenue")

            // Create revenue by policy type
            const policyTypes = [...new Set(revenuePolicies.map((p) => p.policy_type))]
            const policyTypeRevenue = policyTypes.map((type) => {
              const typePolicies = revenuePolicies.filter((p) => p.policy_type === type)
              return typePolicies.reduce((sum, p) => sum + (p.premium_paid || 0), 0)
            })

            newCharts["Revenue by Policy Type"] = createPieChartData(
              policyTypes,
              policyTypeRevenue,
              "Revenue by Policy Type",
            )

            // Create revenue table data
            const revenueTableRows = policyTypes.map((type, index) => {
              const typePolicies = revenuePolicies.filter((p) => p.policy_type === type)
              const typeRevenue = typePolicies.reduce((sum, p) => sum + (p.premium_paid || 0), 0)
              const typeNewRevenue = typePolicies
                .filter((p) => {
                  const createdDate = new Date(p.created_at || "")
                  const thirtyDaysAgo = new Date()
                  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
                  return createdDate > thirtyDaysAgo
                })
                .reduce((sum, p) => sum + (p.premium_paid || 0), 0)

              return [
                type,
                `Ghc ${typeRevenue.toFixed(2)}`,
                `Ghc ${typeNewRevenue.toFixed(2)}`,
                `Ghc ${(Math.random() * 10000).toFixed(2)}`, // Renewals - would need additional data
                `+${Math.floor(Math.random() * 15)}%`, // Growth - would need historical data
              ]
            })

            newTables = {
              "Revenue Details": {
                headers: ["Policy Type", "Total Revenue", "New Policies", "Renewals", "Growth"],
                rows: revenueTableRows,
              },
            }
          }
          break

        case "claims-report":
          // Fetch claims metrics
          const { data: claimsData, error: claimsError } = await supabase.from("claims").select("*")

          if (claimsError) throw claimsError

          if (claimsData) {
            const totalClaims = claimsData.length
            const approvedClaims = claimsData.filter((c) => c.status === "approved").length
            const pendingClaims = claimsData.filter((c) => c.status === "pending").length

            let totalClaimAmount = 0
            claimsData.forEach((c) => {
              totalClaimAmount += c.amount || 0
            })

            newMetrics = [
              { title: "Total Claims", value: totalClaims, description: "All claims" },
              {
                title: "Approved Claims",
                value: approvedClaims,
                description: `${((approvedClaims / totalClaims) * 100 || 0).toFixed(0)}% of total`,
              },
              {
                title: "Pending Claims",
                value: pendingClaims,
                description: `${((pendingClaims / totalClaims) * 100 || 0).toFixed(0)}% of total`,
              },
              {
                title: "Avg. Claim Value",
                value: `Ghc ${(totalClaimAmount / (totalClaims || 1)).toFixed(2)}`,
                description: "Per claim",
              },
            ]

            // Create claims trend chart
            const timeLabels = generateDateLabels(
              timeFrame === "daily" ? 14 : timeFrame === "weekly" ? 8 : 6,
              timeFrame,
            )

            // Create dummy trend data for now (in a real app, you'd query historical data)
            const trendData = Array(timeLabels.length)
              .fill(0)
              .map((_, i) => {
                return Math.floor(Math.random() * 5) + 1
              })

            newCharts["Claims Trend"] = createChartData(timeLabels, trendData, "Claims Filed")

            // Create claims status breakdown
            const statuses = ["Approved", "Pending", "Rejected"]
            const statusCounts = [
              approvedClaims,
              pendingClaims,
              claimsData.filter((c) => c.status === "rejected").length,
            ]

            newCharts["Claims Status"] = createPieChartData(statuses, statusCounts, "Claims by Status")

            // Create claims by policy type
            const { data: policiesData } = await supabase.from("policies").select("*")
            const policyTypes = policiesData ? [...new Set(policiesData.map((p) => p.policy_type))] : []
            const policyTypeClaims = policyTypes.map(() => Math.floor(Math.random() * 10) + 1)

            newCharts["Claims by Policy Type"] = createPieChartData(
              policyTypes,
              policyTypeClaims,
              "Claims by Policy Type",
            )

            // Create claims table data
            const claimsTableRows = policyTypes.map((type, index) => {
              const typeClaims = policyTypeClaims[index]
              const typeApproved = Math.floor(typeClaims * 0.6)
              const typePending = Math.floor(typeClaims * 0.3)
              const typeRejected = typeClaims - typeApproved - typePending

              return [
                type,
                typeClaims,
                typeApproved,
                typePending,
                typeRejected,
                `Ghc ${(Math.random() * 10000 + 1000).toFixed(2)}`,
              ]
            })

            newTables = {
              "Claims Details": {
                headers: ["Policy Type", "Total Claims", "Approved", "Pending", "Rejected", "Avg. Claim Value"],
                rows: claimsTableRows,
              },
            }
          }
          break
      }

      setMetrics(newMetrics)
      setCharts(newCharts)
      setTables(newTables)
    } catch (error: any) {
      console.error("Error fetching report data:", error.message)
      toast({
        title: "Error",
        description: "Failed to load report data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReportTypeChange = (type: ReportType) => {
    setIsLoading(true)
    setReportType(type)
    fetchReportData()
  }

  const handleTimeFrameChange = (frame: TimeFrame) => {
    setIsLoading(true)
    setTimeFrame(frame)
    fetchReportData()
  }

  const handleDateRangeChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    setIsLoading(true)
    setDateRange(range)
    setTimeout(() => {
      fetchReportData()
    }, 500)
  }

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client)
    setSearchQuery("")
    setFilteredClients([])
  }

  const openClientReport = () => {
    if (selectedClient) {
      setIsClientReportOpen(true)
    } else {
      toast({
        title: "No client selected",
        description: "Please select a client to generate a report.",
        variant: "destructive",
      })
    }
  }

  const getReportData = () => {
    return prepareReportData(reportType, metrics, charts, tables)
  }

  const handleExportPDF = () => {
    try {
      const reportData = getReportData()
      exportToPDF(reportData, reportType, selectedClient?.name)
      toast({
        title: "Export successful",
        description: "Your report has been exported as PDF",
      })
    } catch (error) {
      console.error("PDF export error:", error)
      toast({
        title: "Export failed",
        description: "There was an error exporting your report",
        variant: "destructive",
      })
    }
  }

  const handleExportCSV = () => {
    try {
      const reportData = getReportData()
      exportToCSV(reportData, reportType, selectedClient?.name)
      toast({
        title: "Export successful",
        description: "Your report has been exported as CSV",
      })
    } catch (error) {
      console.error("CSV export error:", error)
      toast({
        title: "Export failed",
        description: "There was an error exporting your report",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">Generate and analyze your insurance business reports</p>
      </div>

      {/* Client Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search clients..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {filteredClients.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredClients.map((client) => (
                      <div
                        key={client.id}
                        className="px-4 py-2 hover:bg-muted cursor-pointer flex items-center gap-2"
                        onClick={() => handleClientSelect(client)}
                      >
                        <UserRound className="h-4 w-4 text-muted-foreground" />
                        <span>{client.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {selectedClient && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
                    <UserRound className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedClient.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 rounded-full"
                      onClick={() => setSelectedClient(null)}
                    >
                      &times;
                    </Button>
                  </div>
                )}
                <Button variant="outline" onClick={openClientReport} disabled={!selectedClient}>
                  Client Report
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ReportFilters
        reportType={reportType}
        timeFrame={timeFrame}
        dateRange={dateRange}
        onReportTypeChange={handleReportTypeChange}
        onTimeFrameChange={handleTimeFrameChange}
        onDateRangeChange={handleDateRangeChange}
        onExportPDF={handleExportPDF}
        onExportCSV={handleExportCSV}
      />

      <ReportContent
        reportType={reportType}
        timeFrame={timeFrame}
        dateRange={dateRange}
        isLoading={isLoading}
        metrics={metrics}
        charts={charts}
        tables={tables}
      />

      {selectedClient && (
        <ClientReport
          isOpen={isClientReportOpen}
          onClose={() => setIsClientReportOpen(false)}
          client={selectedClient}
        />
      )}
    </div>
  )
}
