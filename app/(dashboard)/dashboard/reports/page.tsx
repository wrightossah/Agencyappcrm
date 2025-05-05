"use client"

import { useState } from "react"
import { ReportFilters } from "@/components/reports/report-filters"
import { ReportContent } from "@/components/reports/report-content"
import type { ReportType, TimeFrame } from "@/lib/types"
import { exportToCSV, exportToPDF, prepareReportData } from "@/lib/export-utils"
import { toast } from "@/components/ui/use-toast"

// Import mock data generators
import {
  generatePolicyTableData,
  generateClientTableData,
  generateRevenueTableData,
  generateClaimsTableData,
  generatePolicyTrendData,
  generatePolicyTypeData,
  generateClientAcquisitionData,
  generateClientSourceData,
  generateRevenueData,
  generateRevenueByPolicyTypeData,
  generateClaimsData,
  generateClaimsStatusData,
  generateClaimsByPolicyTypeData,
} from "@/lib/mock-data"

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("policy-summary")
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("monthly")
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleReportTypeChange = (type: ReportType) => {
    setIsLoading(true)
    setReportType(type)
    // Simulate loading delay
    setTimeout(() => setIsLoading(false), 800)
  }

  const handleTimeFrameChange = (frame: TimeFrame) => {
    setIsLoading(true)
    setTimeFrame(frame)
    // Simulate loading delay
    setTimeout(() => setIsLoading(false), 800)
  }

  const handleDateRangeChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    setIsLoading(true)
    setDateRange(range)
    // Simulate loading delay
    setTimeout(() => setIsLoading(false), 800)
  }

  const getReportData = () => {
    // Generate metrics based on report type
    let metrics = []
    let charts = {}
    let tables = {}

    switch (reportType) {
      case "policy-summary":
        metrics = [
          { title: "Total Policies", value: 345, description: "Active policies" },
          { title: "New Policies", value: 48, description: "This period", trend: 12 },
          { title: "Renewals", value: 29, description: "This period", trend: 5 },
          { title: "Avg. Premium", value: `Ghc 1450`, description: "Per policy", trend: -2 },
        ]
        charts = {
          "Policy Trend": generatePolicyTrendData(timeFrame),
          "Policy Type Breakdown": generatePolicyTypeData(),
        }
        tables = {
          "Policy Details": generatePolicyTableData(),
        }
        break
      case "client-acquisition":
        metrics = [
          { title: "Total Clients", value: 153, description: "Active clients" },
          { title: "New Clients", value: 28, description: "This period", trend: 15 },
          { title: "Conversion Rate", value: "58%", description: "From leads", trend: 8 },
          { title: "Avg. First Policy", value: `Ghc 1250`, description: "Per new client", trend: 3 },
        ]
        charts = {
          "Client Acquisition Trend": generateClientAcquisitionData(timeFrame),
          "Client Source Breakdown": generateClientSourceData(),
        }
        tables = {
          "Client Acquisition Details": generateClientTableData(),
        }
        break
      case "revenue-analysis":
        metrics = [
          { title: "Total Revenue", value: `Ghc 454,700`, description: "All policies" },
          { title: "New Policies", value: `Ghc 72,050`, description: "This period", trend: 12 },
          { title: "Renewals", value: `Ghc 38,900`, description: "This period", trend: 5 },
          { title: "Growth Rate", value: "10.5%", description: "Year over year", trend: 2.5 },
        ]
        charts = {
          "Revenue Trend": generateRevenueData(timeFrame),
          "Revenue by Policy Type": generateRevenueByPolicyTypeData(),
        }
        tables = {
          "Revenue Details": generateRevenueTableData(),
        }
        break
      case "claims-report":
        metrics = [
          { title: "Total Claims", value: 64, description: "All policies" },
          { title: "Approved Claims", value: 36, description: "56% of total" },
          { title: "Pending Claims", value: 20, description: "31% of total", trend: -8 },
          { title: "Avg. Claim Value", value: `Ghc 8,750`, description: "Per claim", trend: 5 },
        ]
        charts = {
          "Claims Trend": generateClaimsData(timeFrame),
          "Claims Status": generateClaimsStatusData(),
          "Claims by Policy Type": generateClaimsByPolicyTypeData(),
        }
        tables = {
          "Claims Details": generateClaimsTableData(),
        }
        break
    }

    return prepareReportData(reportType, metrics, charts, tables)
  }

  const handleExportPDF = () => {
    try {
      const reportData = getReportData()
      exportToPDF(reportData, reportType)
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
      exportToCSV(reportData, reportType)
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

      <ReportContent reportType={reportType} timeFrame={timeFrame} dateRange={dateRange} isLoading={isLoading} />
    </div>
  )
}
