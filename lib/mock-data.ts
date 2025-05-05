import type { ChartData, PolicyType, TableData } from "./types"

// Helper function to generate random data
export function generateRandomData(count: number, min: number, max: number): number[] {
  return Array.from({ length: count }, () => Math.floor(Math.random() * (max - min + 1)) + min)
}

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

// Generate policy trend data
export function generatePolicyTrendData(timeFrame: "daily" | "weekly" | "monthly"): ChartData {
  const count = timeFrame === "daily" ? 14 : timeFrame === "weekly" ? 8 : 6
  const labels = generateDateLabels(count, timeFrame)

  return {
    labels,
    datasets: [
      {
        label: "Policies Sold",
        data: generateRandomData(count, 10, 50),
        borderColor: "hsl(var(--primary))",
        backgroundColor: "rgba(var(--primary), 0.1)",
        borderWidth: 2,
        fill: true,
      },
    ],
  }
}

// Generate policy type breakdown data
export function generatePolicyTypeData(): ChartData {
  return {
    labels: policyTypes,
    datasets: [
      {
        label: "Policies by Type",
        data: generateRandomData(policyTypes.length, 10, 100),
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(153, 102, 255, 0.7)",
        ],
        borderWidth: 1,
      },
    ],
  }
}

// Generate client acquisition data
export function generateClientAcquisitionData(timeFrame: "daily" | "weekly" | "monthly"): ChartData {
  const count = timeFrame === "daily" ? 14 : timeFrame === "weekly" ? 8 : 6
  const labels = generateDateLabels(count, timeFrame)

  return {
    labels,
    datasets: [
      {
        label: "New Clients",
        data: generateRandomData(count, 5, 25),
        borderColor: "hsl(var(--primary))",
        backgroundColor: "rgba(var(--primary), 0.1)",
        borderWidth: 2,
        fill: true,
      },
    ],
  }
}

// Generate client source data
export function generateClientSourceData(): ChartData {
  const sources = ["Referral", "Social Media", "Direct", "Website", "Other"]

  return {
    labels: sources,
    datasets: [
      {
        label: "Clients by Source",
        data: generateRandomData(sources.length, 5, 50),
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(153, 102, 255, 0.7)",
        ],
        borderWidth: 1,
      },
    ],
  }
}

// Generate revenue data
export function generateRevenueData(timeFrame: "daily" | "weekly" | "monthly"): ChartData {
  const count = timeFrame === "daily" ? 14 : timeFrame === "weekly" ? 8 : 6
  const labels = generateDateLabels(count, timeFrame)

  return {
    labels,
    datasets: [
      {
        label: "Revenue",
        data: generateRandomData(count, 5000, 25000),
        borderColor: "hsl(var(--primary))",
        backgroundColor: "rgba(var(--primary), 0.1)",
        borderWidth: 2,
        fill: true,
      },
    ],
  }
}

// Generate revenue by policy type data
export function generateRevenueByPolicyTypeData(): ChartData {
  return {
    labels: policyTypes,
    datasets: [
      {
        label: "Revenue by Policy Type",
        data: generateRandomData(policyTypes.length, 5000, 50000),
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(153, 102, 255, 0.7)",
        ],
        borderWidth: 1,
      },
    ],
  }
}

// Generate claims data
export function generateClaimsData(timeFrame: "daily" | "weekly" | "monthly"): ChartData {
  const count = timeFrame === "daily" ? 14 : timeFrame === "weekly" ? 8 : 6
  const labels = generateDateLabels(count, timeFrame)

  return {
    labels,
    datasets: [
      {
        label: "Claims Filed",
        data: generateRandomData(count, 2, 15),
        borderColor: "hsl(var(--primary))",
        backgroundColor: "rgba(var(--primary), 0.1)",
        borderWidth: 2,
        fill: true,
      },
    ],
  }
}

// Generate claims status data
export function generateClaimsStatusData(): ChartData {
  const statuses = ["Approved", "Pending", "Rejected"]

  return {
    labels: statuses,
    datasets: [
      {
        label: "Claims by Status",
        data: generateRandomData(statuses.length, 5, 50),
        backgroundColor: ["rgba(75, 192, 192, 0.7)", "rgba(255, 206, 86, 0.7)", "rgba(255, 99, 132, 0.7)"],
        borderWidth: 1,
      },
    ],
  }
}

// Generate claims by policy type data
export function generateClaimsByPolicyTypeData(): ChartData {
  return {
    labels: policyTypes,
    datasets: [
      {
        label: "Claims by Policy Type",
        data: generateRandomData(policyTypes.length, 2, 30),
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(153, 102, 255, 0.7)",
        ],
        borderWidth: 1,
      },
    ],
  }
}

// Generate policy table data
export function generatePolicyTableData(): TableData {
  return {
    headers: ["Policy Type", "Total Policies", "New Policies", "Renewals", "Avg. Premium"],
    rows: [
      ["Motor", 156, 23, 18, "Ghc 1,250"],
      ["Travel", 89, 12, 5, "Ghc 450"],
      ["GIT", 42, 8, 3, "Ghc 2,100"],
      ["Marine", 31, 4, 2, "Ghc 3,500"],
      ["Other", 27, 6, 1, "Ghc 850"],
    ],
  }
}

// Generate client acquisition table data
export function generateClientTableData(): TableData {
  return {
    headers: ["Source", "New Clients", "Conversion Rate", "Avg. First Policy Value"],
    rows: [
      ["Referral", 42, "68%", "Ghc 1,450"],
      ["Social Media", 31, "42%", "Ghc 950"],
      ["Direct", 27, "75%", "Ghc 1,850"],
      ["Website", 38, "51%", "Ghc 1,200"],
      ["Other", 15, "45%", "Ghc 1,100"],
    ],
  }
}

// Generate revenue table data
export function generateRevenueTableData(): TableData {
  return {
    headers: ["Policy Type", "Total Revenue", "New Policies", "Renewals", "Growth"],
    rows: [
      ["Motor", "Ghc 195,000", "Ghc 28,750", "Ghc 22,500", "+12%"],
      ["Travel", "Ghc 40,050", "Ghc 5,400", "Ghc 2,250", "+8%"],
      ["GIT", "Ghc 88,200", "Ghc 16,800", "Ghc 6,300", "+15%"],
      ["Marine", "Ghc 108,500", "Ghc 14,000", "Ghc 7,000", "+5%"],
      ["Other", "Ghc 22,950", "Ghc 5,100", "Ghc 850", "+3%"],
    ],
  }
}

// Generate claims table data
export function generateClaimsTableData(): TableData {
  return {
    headers: ["Policy Type", "Total Claims", "Approved", "Pending", "Rejected", "Avg. Claim Value"],
    rows: [
      ["Motor", 32, 18, 10, 4, "Ghc 4,250"],
      ["Travel", 15, 9, 4, 2, "Ghc 850"],
      ["GIT", 8, 5, 2, 1, "Ghc 12,500"],
      ["Marine", 5, 2, 3, 0, "Ghc 35,000"],
      ["Other", 4, 2, 1, 1, "Ghc 1,800"],
    ],
  }
}
