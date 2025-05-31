"use client"

import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { ActivityTracker } from "@/components/dashboard/activity-tracker"
import { useAuth } from "@/components/auth-provider"

export default function DashboardPage() {
  const { profile } = useAuth()

  const getWelcomeMessage = () => {
    const name = profile?.full_name || profile?.first_name || "Agent"
    const hour = new Date().getHours()

    if (hour < 12) {
      return `Good morning, ${name}!`
    } else if (hour < 17) {
      return `Good afternoon, ${name}!`
    } else {
      return `Good evening, ${name}!`
    }
  }

  return (
    <div className="space-y-8">
      {/* Personalized Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{getWelcomeMessage()}</h1>
        <p className="text-muted-foreground">Here's an overview of your insurance business today.</p>
      </div>

      {/* Live Dashboard Stats */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Business Overview</h2>
          <div className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleTimeString()}</div>
        </div>
        <DashboardStats />
      </div>

      {/* Activity Tracker */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">CRM Activity</h2>
        <ActivityTracker />
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Quick Actions</h2>
        <QuickActions />
      </div>
    </div>
  )
}
