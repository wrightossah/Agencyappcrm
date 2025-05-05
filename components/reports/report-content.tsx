"use client"

import type { ReportType, TimeFrame } from "@/lib/types"
import { PolicySummaryReport } from "./policy-summary-report"
import { ClientAcquisitionReport } from "./client-acquisition-report"
import { RevenueAnalysisReport } from "./revenue-analysis-report"
import { ClaimsReport } from "./claims-report"
import { Skeleton } from "@/components/ui/skeleton"

interface ReportContentProps {
  reportType: ReportType
  timeFrame: TimeFrame
  dateRange: { from: Date | undefined; to: Date | undefined }
  isLoading: boolean
}

export function ReportContent({ reportType, timeFrame, dateRange, isLoading }: ReportContentProps) {
  if (isLoading) {
    return <ReportSkeleton />
  }

  switch (reportType) {
    case "policy-summary":
      return <PolicySummaryReport timeFrame={timeFrame} dateRange={dateRange} />
    case "client-acquisition":
      return <ClientAcquisitionReport timeFrame={timeFrame} dateRange={dateRange} />
    case "revenue-analysis":
      return <RevenueAnalysisReport timeFrame={timeFrame} dateRange={dateRange} />
    case "claims-report":
      return <ClaimsReport timeFrame={timeFrame} dateRange={dateRange} />
    default:
      return <PolicySummaryReport timeFrame={timeFrame} dateRange={dateRange} />
  }
}

function ReportSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-6">
            <Skeleton className="h-6 w-1/2 mb-2" />
            <Skeleton className="h-10 w-3/4 mb-4" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
      <div className="rounded-lg border bg-card">
        <Skeleton className="h-[300px] w-full rounded-lg" />
      </div>
      <div className="rounded-lg border bg-card p-6">
        <Skeleton className="h-6 w-1/4 mb-4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    </div>
  )
}
