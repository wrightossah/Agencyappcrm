"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useUser } from "@supabase/auth-helpers-react"
import { Skeleton } from "@/components/ui/skeleton"

export function WelcomeMessage() {
  const user = useUser()
  const [agentName, setAgentName] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAgentName() {
      if (!user?.id) return

      try {
        // Try to get name from user metadata first
        const metadataName = user.user_metadata?.full_name || user.user_metadata?.name

        if (metadataName) {
          setAgentName(metadataName)
          setLoading(false)
          return
        }

        // If not in metadata, check profiles table
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, first_name, last_name")
          .eq("id", user.id)
          .single()

        if (profile) {
          const name =
            profile.full_name ||
            (profile.first_name && profile.last_name
              ? `${profile.first_name} ${profile.last_name}`
              : profile.first_name || profile.last_name)

          setAgentName(name || "")
        }
      } catch (error) {
        console.error("Error fetching agent name:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAgentName()
  }, [user])

  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening"

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="space-y-3">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-2xl">👋</span>
          </div>
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-blue-900">
            {greeting}
            {agentName ? `, ${agentName}` : ""}!
          </h1>
          <p className="text-blue-700 text-sm">{currentDate}</p>
          <p className="text-blue-600 text-sm mt-1">
            Ready to manage your clients and grow your insurance business today.
          </p>
        </div>
      </div>
    </div>
  )
}
