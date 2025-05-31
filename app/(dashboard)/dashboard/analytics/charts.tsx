"use client"

import { useTheme } from "next-themes"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

// Custom colors for charts that work in both light and dark mode
const CHART_COLORS = [
  "#0ea5e9", // sky-500
  "#8b5cf6", // violet-500
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#ef4444", // red-500
  "#ec4899", // pink-500
  "#0891b2", // cyan-600
  "#4f46e5", // indigo-600
]

// Sales Performance Chart
export const SalesPerformanceChart = ({ data }: { data: any[] }) => {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#e5e7eb"} />
        <XAxis
          dataKey="month"
          tick={{ fill: isDark ? "#9ca3af" : "#4b5563" }}
          tickLine={{ stroke: isDark ? "#4b5563" : "#9ca3af" }}
          axisLine={{ stroke: isDark ? "#4b5563" : "#d1d5db" }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis
          yAxisId="left"
          orientation="left"
          tick={{ fill: isDark ? "#9ca3af" : "#4b5563" }}
          tickLine={{ stroke: isDark ? "#4b5563" : "#9ca3af" }}
          axisLine={{ stroke: isDark ? "#4b5563" : "#d1d5db" }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tickFormatter={(value) => `₵${value}`}
          tick={{ fill: isDark ? "#9ca3af" : "#4b5563" }}
          tickLine={{ stroke: isDark ? "#4b5563" : "#9ca3af" }}
          axisLine={{ stroke: isDark ? "#4b5563" : "#d1d5db" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? "#1f2937" : "#ffffff",
            borderColor: isDark ? "#374151" : "#e5e7eb",
            color: isDark ? "#e5e7eb" : "#374151",
          }}
          formatter={(value, name) => {
            if (name === "revenue") return [`₵${value}`, "Revenue"]
            return [value, "Sales"]
          }}
        />
        <Legend />
        <Bar
          yAxisId="left"
          dataKey="sales"
          fill={CHART_COLORS[0]}
          name="Sales"
          animationDuration={1000}
          radius={[4, 4, 0, 0]}
        />
        <Bar
          yAxisId="right"
          dataKey="revenue"
          fill={CHART_COLORS[1]}
          name="Revenue"
          animationDuration={1000}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

// Commission Breakdown Chart
export const CommissionBreakdownChart = ({ data }: { data: any[] }) => {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#e5e7eb"} />
        <XAxis
          type="number"
          tick={{ fill: isDark ? "#9ca3af" : "#4b5563" }}
          tickLine={{ stroke: isDark ? "#4b5563" : "#9ca3af" }}
          axisLine={{ stroke: isDark ? "#4b5563" : "#d1d5db" }}
          tickFormatter={(value) => `₵${value}`}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fill: isDark ? "#9ca3af" : "#4b5563" }}
          tickLine={{ stroke: isDark ? "#4b5563" : "#9ca3af" }}
          axisLine={{ stroke: isDark ? "#4b5563" : "#d1d5db" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? "#1f2937" : "#ffffff",
            borderColor: isDark ? "#374151" : "#e5e7eb",
            color: isDark ? "#e5e7eb" : "#374151",
          }}
          formatter={(value, name) => [`₵${value}`, name === "premium" ? "Premium" : "Commission"]}
        />
        <Legend />
        <Bar dataKey="premium" fill={CHART_COLORS[2]} name="Premium" animationDuration={1000} radius={[0, 4, 4, 0]} />
        <Bar
          dataKey="commission"
          fill={CHART_COLORS[3]}
          name="Commission"
          animationDuration={1000}
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

// Policy Distribution Chart
export const PolicyDistributionChart = ({ data }: { data: any[] }) => {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={true}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
          animationDuration={1000}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? "#1f2937" : "#ffffff",
            borderColor: isDark ? "#374151" : "#e5e7eb",
            color: isDark ? "#e5e7eb" : "#374151",
          }}
          formatter={(value) => [value, "Policies"]}
        />
        <Legend formatter={(value) => <span style={{ color: isDark ? "#e5e7eb" : "#374151" }}>{value}</span>} />
      </PieChart>
    </ResponsiveContainer>
  )
}

// Client Activity Chart
export const ClientActivityChart = ({ data }: { data: any[] }) => {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#e5e7eb"} />
        <XAxis
          dataKey="name"
          tick={{ fill: isDark ? "#9ca3af" : "#4b5563" }}
          tickLine={{ stroke: isDark ? "#4b5563" : "#9ca3af" }}
          axisLine={{ stroke: isDark ? "#4b5563" : "#d1d5db" }}
        />
        <YAxis
          tick={{ fill: isDark ? "#9ca3af" : "#4b5563" }}
          tickLine={{ stroke: isDark ? "#4b5563" : "#9ca3af" }}
          axisLine={{ stroke: isDark ? "#4b5563" : "#d1d5db" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? "#1f2937" : "#ffffff",
            borderColor: isDark ? "#374151" : "#e5e7eb",
            color: isDark ? "#e5e7eb" : "#374151",
          }}
          formatter={(value) => [value, "Clients"]}
        />
        <Legend />
        <Bar dataKey="value" name="Clients" animationDuration={1000} radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={index === 0 ? CHART_COLORS[4] : CHART_COLORS[5]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
