"use client"

import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { WelcomeMessage } from "@/components/dashboard/welcome-message"

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Message */}
      <WelcomeMessage />

      {/* Insight Summary Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Business Overview</h2>
          <div className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleTimeString()}</div>
        </div>
        <DashboardStats />
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Quick Actions</h2>
        <QuickActions />
      </div>
    </div>
  )
}
