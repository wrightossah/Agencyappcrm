import type React from "react"
export type ReportType = "policy-summary" | "client-acquisition" | "revenue-analysis" | "claims-report"
export type TimeFrame = "daily" | "weekly" | "monthly"
export type PolicyType = "Motor" | "Travel" | "GIT" | "Marine" | "Other"
export type ClientSource = "Referral" | "Social Media" | "Direct" | "Website" | "Other"
export type ClaimStatus = "Approved" | "Pending" | "Rejected"

export interface MetricCardProps {
  title: string
  value: string | number
  description?: string
  trend?: number
  icon?: React.ReactNode
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
    fill?: boolean
  }[]
}

export interface TableData {
  headers: string[]
  rows: (string | number)[][]
}

export interface ReportData {
  title: string
  description: string
  metrics: MetricCardProps[]
  charts: {
    [key: string]: ChartData
  }
  tables: {
    [key: string]: TableData
  }
}
