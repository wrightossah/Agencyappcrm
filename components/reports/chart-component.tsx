"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ChartData } from "@/lib/types"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)

interface ChartComponentProps {
  title: string
  description?: string
  chartData: ChartData
  type: "line" | "bar" | "pie" | "doughnut"
  height?: number
}

export function ChartComponent({ title, description, chartData, type, height = 300 }: ChartComponentProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    chartInstance.current = new Chart(ctx, {
      type,
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
          },
        },
        scales:
          type !== "pie" && type !== "doughnut"
            ? {
                x: {
                  grid: {
                    display: false,
                  },
                },
                y: {
                  beginAtZero: true,
                  grid: {
                    borderDash: [2, 4],
                    color: "#e5e7eb",
                  },
                },
              }
            : undefined,
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [chartData, type])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div style={{ height: `${height}px` }}>
          <canvas ref={chartRef} />
        </div>
      </CardContent>
    </Card>
  )
}
