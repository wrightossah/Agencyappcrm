"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { ClientAcquisitionReport } from "./client-acquisition-report"
import { PolicySummaryReport } from "./policy-summary-report"
import { RevenueAnalysisReport } from "./revenue-analysis-report"
import { ClaimsReport } from "./claims-report"
import type { ReportType, TimeFrame } from "@/lib/types"

interface ReportContentProps {
  reportType: ReportType
  timeFrame: TimeFrame
  dateRange: { from: Date | undefined; to: Date | undefined }
  isLoading: boolean
  metrics?: any[]
  charts?: any
  tables?: any
}

export function ReportContent({
  reportType,
  timeFrame,
  dateRange,
  isLoading,
  metrics = [],
  charts = {},
  tables = {},
}: ReportContentProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px] w-full" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  switch (reportType) {
    case "policy-summary":
      return (
        <PolicySummaryReport
          timeFrame={timeFrame}
          dateRange={dateRange}
          metrics={metrics}
          charts={charts}
          tables={tables}
        />
      )
    case "client-acquisition":
      return (
        <ClientAcquisitionReport
          timeFrame={timeFrame}
          dateRange={dateRange}
          metrics={metrics}
          charts={charts}
          tables={tables}
        />
      )
    case "revenue-analysis":
      return (
        <RevenueAnalysisReport
          timeFrame={timeFrame}
          dateRange={dateRange}
          metrics={metrics}
          charts={charts}
          tables={tables}
        />
      )
    case "claims-report":
      return (
        <ClaimsReport timeFrame={timeFrame} dateRange={dateRange} metrics={metrics} charts={charts} tables={tables} />
      )
    default:
      return (
        <PolicySummaryReport
          timeFrame={timeFrame}
          dateRange={dateRange}
          metrics={metrics}
          charts={charts}
          tables={tables}
        />
      )
  }
}
