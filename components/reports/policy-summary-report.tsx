"use client"

import { FileText } from "lucide-react"
import { MetricCard } from "./metric-card"
import { DataTable } from "./data-table"
import type { TimeFrame } from "@/lib/types"
import { generatePolicyTableData } from "@/lib/mock-data"

interface PolicySummaryReportProps {
  timeFrame: TimeFrame
  dateRange: { from: Date | undefined; to: Date | undefined }
}

export function PolicySummaryReport({ timeFrame, dateRange }: PolicySummaryReportProps) {
  // Generate random metrics
  const totalPolicies = 345
  const newPolicies = 48
  const renewals = 29
  const avgPremium = 1450

  // Generate table data
  const policyTableData = generatePolicyTableData()

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Policies"
          value={totalPolicies}
          description="Active policies"
          icon={<FileText className="h-4 w-4" />}
        />
        <MetricCard
          title="New Policies"
          value={newPolicies}
          description="This period"
          trend={12}
          icon={<FileText className="h-4 w-4" />}
        />
        <MetricCard
          title="Renewals"
          value={renewals}
          description="This period"
          trend={5}
          icon={<FileText className="h-4 w-4" />}
        />
        <MetricCard
          title="Avg. Premium"
          value={`Ghc ${avgPremium}`}
          description="Per policy"
          trend={-2}
          icon={<FileText className="h-4 w-4" />}
        />
      </div>

      <DataTable
        title="Policy Details"
        description="Detailed breakdown of policies by type"
        tableData={policyTableData}
      />
    </div>
  )
}
