"use client"

import { Users } from "lucide-react"
import { MetricCard } from "./metric-card"
import { ChartComponent } from "./chart-component"
import { DataTable } from "./data-table"
import type { TimeFrame } from "@/lib/types"

interface ClientAcquisitionReportProps {
  timeFrame: TimeFrame
  dateRange: { from: Date | undefined; to: Date | undefined }
  metrics?: any[]
  charts?: any
  tables?: any
}

export function ClientAcquisitionReport({
  timeFrame,
  dateRange,
  metrics = [],
  charts = {},
  tables = {},
}: ClientAcquisitionReportProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <MetricCard
            key={index}
            title={metric.title}
            value={metric.value}
            description={metric.description}
            trend={metric.trend}
            icon={<Users className="h-4 w-4" />}
          />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {Object.entries(charts).map(([title, chartData], index) => (
          <ChartComponent
            key={index}
            title={title}
            description={`${title} for the selected ${timeFrame} period`}
            chartData={chartData}
            type={(title?.toLowerCase() || "").includes("breakdown") ? "pie" : "line"}
          />
        ))}
      </div>

      {Object.entries(tables).map(([title, tableData], index) => (
        <DataTable
          key={index}
          title={title}
          description={`Detailed breakdown of ${title.toLowerCase()}`}
          tableData={tableData}
        />
      ))}
    </div>
  )
}
