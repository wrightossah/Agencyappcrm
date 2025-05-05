"use client"

import { Users } from "lucide-react"
import { MetricCard } from "./metric-card"
import { ChartComponent } from "./chart-component"
import { DataTable } from "./data-table"
import type { TimeFrame } from "@/lib/types"
import { generateClientAcquisitionData, generateClientSourceData, generateClientTableData } from "@/lib/mock-data"

interface ClientAcquisitionReportProps {
  timeFrame: TimeFrame
  dateRange: { from: Date | undefined; to: Date | undefined }
}

export function ClientAcquisitionReport({ timeFrame, dateRange }: ClientAcquisitionReportProps) {
  // Generate random metrics
  const totalClients = 153
  const newClients = 28
  const conversionRate = 58
  const avgFirstPolicy = 1250

  // Generate chart data
  const clientAcquisitionData = generateClientAcquisitionData(timeFrame)
  const clientSourceData = generateClientSourceData()

  // Generate table data
  const clientTableData = generateClientTableData()

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Clients"
          value={totalClients}
          description="Active clients"
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard
          title="New Clients"
          value={newClients}
          description="This period"
          trend={15}
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard
          title="Conversion Rate"
          value={`${conversionRate}%`}
          description="From leads"
          trend={8}
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard
          title="Avg. First Policy"
          value={`$${avgFirstPolicy}`}
          description="Per new client"
          trend={3}
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ChartComponent
          title="Client Acquisition Trend"
          description={`New client acquisition trend for the selected ${timeFrame} period`}
          chartData={clientAcquisitionData}
          type="line"
        />
        <ChartComponent
          title="Client Source Breakdown"
          description="Distribution of clients by acquisition source"
          chartData={clientSourceData}
          type="pie"
        />
      </div>

      <DataTable
        title="Client Acquisition Details"
        description="Detailed breakdown of client acquisition by source"
        tableData={clientTableData}
      />
    </div>
  )
}
