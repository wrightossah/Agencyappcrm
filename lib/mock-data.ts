import type { PolicyType } from "./types"

// This file now only contains type definitions and utility functions
// All dummy data has been removed and replaced with real data from Supabase

// Helper function to generate dates for the last n days/weeks/months
export function generateDateLabels(count: number, timeFrame: "daily" | "weekly" | "monthly"): string[] {
  const labels: string[] = []
  const date = new Date()

  for (let i = count - 1; i >= 0; i--) {
    const tempDate = new Date(date)

    if (timeFrame === "daily") {
      tempDate.setDate(date.getDate() - i)
      labels.push(tempDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }))
    } else if (timeFrame === "weekly") {
      tempDate.setDate(date.getDate() - i * 7)
      labels.push(`Week ${count - i}`)
    } else if (timeFrame === "monthly") {
      tempDate.setMonth(date.getMonth() - i)
      labels.push(tempDate.toLocaleDateString("en-US", { month: "short", year: "numeric" }))
    }
  }

  return labels
}

// Policy types
export const policyTypes: PolicyType[] = ["Motor", "Travel", "GIT", "Marine", "Other"]
