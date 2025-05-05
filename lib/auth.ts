import { supabase } from "./supabase"
import { redirect } from "next/navigation"

export async function signUp(email: string, password: string, fullName = "", company = "", phoneNumber = "") {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) throw error

  // Create a profile for the new user with default trial values
  if (data.user) {
    try {
      const trialStartDate = new Date()
      const trialEndDate = new Date(trialStartDate)
      trialEndDate.setDate(trialEndDate.getDate() + 14)

      // Extract first and last name from full name
      let firstName = ""
      let lastName = ""

      if (fullName) {
        const nameParts = fullName.trim().split(/\s+/)
        if (nameParts.length > 0) {
          firstName = nameParts[0]
          lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : ""
        }
      }

      await supabase.from("profiles").insert([
        {
          id: data.user.id,
          trial_start_date: trialStartDate.toISOString(),
          trial_end_date: trialEndDate.toISOString(),
          has_active_subscription: false,
          full_name: fullName,
          first_name: firstName,
          last_name: lastName,
          company: company,
          phone_number: phoneNumber,
        },
      ])
    } catch (profileError) {
      console.error("Error creating profile:", profileError)
      // Continue even if profile creation fails
      // The AuthGuard will handle users without profiles
    }
  }

  return data
}

export async function signIn(email: string, password: string, rememberMe = false) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })

  if (error) throw error
}

export async function getUser() {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) return null

  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) {
    redirect("/login")
  }
  return user
}
