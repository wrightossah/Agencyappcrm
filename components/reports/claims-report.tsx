"use client"

import { AlertTriangle } from "lucide-react"
import { MetricCard } from "./metric-card"
import { ChartComponent } from "./chart-component"
import { DataTable } from "./data-table"
import type { TimeFrame } from "@/lib/types"
import {
  generateClaimsData,
  generateClaimsStatusData,
  generateClaimsByPolicyTypeData,
  generateClaimsTableData,
} from "@/lib/mock-data"

interface ClaimsReportProps {
  timeFrame: TimeFrame
  dateRange: { from: Date | undefined; to: Date | undefined }
}

export function ClaimsReport({ timeFrame, dateRange }: ClaimsReportProps) {
  // Generate random metrics
  const totalClaims = 64
  const approvedClaims = 36
  const pendingClaims = 20
  const avgClaimValue = 8750

  // Generate chart data
  const claimsData = generateClaimsData(timeFrame)
  const claimsStatusData = generateClaimsStatusData()
  const claimsByPolicyTypeData = generateClaimsByPolicyTypeData()

  // Generate table data
  const claimsTableData = generateClaimsTableData()

  // Format currency
  const formatCurrency = (value: number) => {
    return `Ghc ${value.toLocaleString()}`
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Claims"
          value={totalClaims}
          description="All policies"
          icon={<AlertTriangle className="h-4 w-4" />}
        />
        <MetricCard
          title="Approved Claims"
          value={approvedClaims}
          description={`${Math.round((approvedClaims / totalClaims) * 100)}% of total`}
          icon={<AlertTriangle className="h-4 w-4" />}
        />
        <MetricCard
          title="Pending Claims"
          value={pendingClaims}
          description={`${Math.round((pendingClaims / totalClaims) * 100)}% of total`}
          trend={-8}
          icon={<AlertTriangle className="h-4 w-4" />}
        />
        <MetricCard
          title="Avg. Claim Value"
          value={formatCurrency(avgClaimValue)}
          description="Per claim"
          trend={5}
          icon={<AlertTriangle className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ChartComponent
          title="Claims Trend"
          description={`Claims filed trend for the selected ${timeFrame} period`}
          chartData={claimsData}
          type="line"
        />
        <ChartComponent
          title="Claims Status"
          description="Distribution of claims by status"
          chartData={claimsStatusData}
          type="pie"
        />
      </div>

      <ChartComponent
        title="Claims by Policy Type"
        description="Distribution of claims by policy type"
        chartData={claimsByPolicyTypeData}
        type="bar"
      />

      <DataTable
        title="Claims Details"
        description="Detailed breakdown of claims by policy type"
        tableData={claimsTableData}
      />
    </div>
  )
}
