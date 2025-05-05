"use client"

import { DollarSign } from "lucide-react"
import { MetricCard } from "./metric-card"
import { ChartComponent } from "./chart-component"
import { DataTable } from "./data-table"
import type { TimeFrame } from "@/lib/types"
import { generateRevenueData, generateRevenueByPolicyTypeData, generateRevenueTableData } from "@/lib/mock-data"

interface RevenueAnalysisReportProps {
  timeFrame: TimeFrame
  dateRange: { from: Date | undefined; to: Date | undefined }
}

export function RevenueAnalysisReport({ timeFrame, dateRange }: RevenueAnalysisReportProps) {
  // Generate random metrics
  const totalRevenue = 454700
  const newPoliciesRevenue = 72050
  const renewalsRevenue = 38900
  const growthRate = 10.5

  // Generate chart data
  const revenueData = generateRevenueData(timeFrame)
  const revenueByPolicyTypeData = generateRevenueByPolicyTypeData()

  // Generate table data
  const revenueTableData = generateRevenueTableData()

  // Format currency
  const formatCurrency = (value: number) => {
    return `Ghc ${value.toLocaleString()}`
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          description="All policies"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <MetricCard
          title="New Policies"
          value={formatCurrency(newPoliciesRevenue)}
          description="This period"
          trend={12}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <MetricCard
          title="Renewals"
          value={formatCurrency(renewalsRevenue)}
          description="This period"
          trend={5}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <MetricCard
          title="Growth Rate"
          value={`${growthRate}%`}
          description="Year over year"
          trend={2.5}
          icon={<DollarSign className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ChartComponent
          title="Revenue Trend"
          description={`Revenue trend for the selected ${timeFrame} period`}
          chartData={revenueData}
          type="line"
        />
        <ChartComponent
          title="Revenue by Policy Type"
          description="Distribution of revenue by policy type"
          chartData={revenueByPolicyTypeData}
          type="bar"
        />
      </div>

      <DataTable
        title="Revenue Details"
        description="Detailed breakdown of revenue by policy type"
        tableData={revenueTableData}
      />
    </div>
  )
}
