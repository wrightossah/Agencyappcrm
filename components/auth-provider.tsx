"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import type { User } from "@/lib/supabase"

type AuthContextType = {
  user: User | null
  profile: any | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastActivity, setLastActivity] = useState(Date.now())
  const router = useRouter()

  // Auto logout after 5 minutes of inactivity
  useEffect(() => {
    const INACTIVITY_TIMEOUT = 5 * 60 * 1000 // 5 minutes

    const updateActivity = () => {
      setLastActivity(Date.now())
    }

    const checkInactivity = () => {
      if (user && Date.now() - lastActivity > INACTIVITY_TIMEOUT) {
        signOut()
      }
    }

    // Add event listeners for user activity
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"]
    events.forEach((event) => {
      document.addEventListener(event, updateActivity, true)
    })

    // Check for inactivity every minute
    const inactivityInterval = setInterval(checkInactivity, 60000)

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, updateActivity, true)
      })
      clearInterval(inactivityInterval)
    }
  }, [user, lastActivity])

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user || null)

      if (session?.user) {
        await fetchProfile(session.user.id)
      }

      setLoading(false)
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user || null)

      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error)
        return
      }

      setProfile(data)
    } catch (err) {
      console.error("Error fetching profile:", err)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
    router.push("/login")
  }

  return <AuthContext.Provider value={{ user, profile, loading, signOut }}>{children}</AuthContext.Provider>
}
