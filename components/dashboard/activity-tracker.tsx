"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"

interface ActivityData {
  clientsAdded: number
  policiesCreated: number
  totalActivity: number
  activityPercentage: number
}

export function ActivityTracker() {
  const [activity, setActivity] = useState<ActivityData | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchActivityData()
    }
  }, [user])

  const fetchActivityData = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Get data from the last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const [clientsResult, policiesResult] = await Promise.all([
        supabase
          .from("clients")
          .select("id", { count: "exact", head: true })
          .eq("created_by", user.id)
          .gte("created_at", thirtyDaysAgo.toISOString()),

        supabase
          .from("policies")
          .select("id", { count: "exact", head: true })
          .eq("created_by", user.id)
          .gte("created_at", thirtyDaysAgo.toISOString()),
      ])

      const clientsAdded = clientsResult.count || 0
      const policiesCreated = policiesResult.count || 0
      const totalActivity = clientsAdded + policiesCreated

      // Calculate activity percentage (out of 100, where 20+ activities = 100%)
      const activityPercentage = Math.min((totalActivity / 20) * 100, 100)

      setActivity({
        clientsAdded,
        policiesCreated,
        totalActivity,
        activityPercentage,
      })
    } catch (error) {
      console.error("Error fetching activity data:", error)
      setActivity({
        clientsAdded: 0,
        policiesCreated: 0,
        totalActivity: 0,
        activityPercentage: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  const getActivityLevel = (percentage: number) => {
    if (percentage >= 80) return { level: "Excellent", color: "text-green-600" }
    if (percentage >= 60) return { level: "Good", color: "text-blue-600" }
    if (percentage >= 40) return { level: "Moderate", color: "text-yellow-600" }
    return { level: "Low", color: "text-red-600" }
  }

  if (loading || !activity) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>CRM Activity (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-16 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const activityInfo = getActivityLevel(activity.activityPercentage)

  return (
    <Card>
      <CardHeader>
        <CardTitle>CRM Activity (Last 30 Days)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Circular Progress Indicator */}
        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
              {/* Background circle */}
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-200"
              />
              {/* Progress circle */}
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                className="text-primary"
                strokeDasharray={`${(activity.activityPercentage / 100) * 314} 314`}
                style={{
                  transition: "stroke-dasharray 0.5s ease-in-out",
                }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold">{Math.round(activity.activityPercentage)}%</div>
                <div className={`text-sm ${activityInfo.color}`}>{activityInfo.level}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{activity.clientsAdded}</div>
            <div className="text-sm text-blue-700">Clients Added</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{activity.policiesCreated}</div>
            <div className="text-sm text-green-700">Policies Created</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Activity</span>
            <span>{activity.totalActivity} actions</span>
          </div>
          <Progress value={activity.activityPercentage} className="h-2" />
        </div>
      </CardContent>
    </Card>
  )
}
