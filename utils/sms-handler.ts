import { supabase } from "@/lib/supabase"

interface Client {
  id: string
  name: string
  phone: string
  phone_number?: string
}

// Check if device is mobile
export function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// Format phone number for SMS
export function formatPhoneForSMS(phone: string): string {
  if (!phone) return ""

  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, "")

  // If it starts with 0, replace with +233 (Ghana country code)
  if (cleaned.startsWith("0")) {
    cleaned = "+233" + cleaned.substring(1)
  }

  // If it doesn't start with +, add +233
  if (!cleaned.startsWith("+")) {
    cleaned = "+233" + cleaned
  }

  return cleaned
}

// Get agent signature
export function getAgentSignature(fullName?: string): string {
  if (fullName) {
    return `\n\nRegards,\n${fullName}`
  }
  return `\n\nRegards,\nYour Insurance Agent`
}

// Format default message
export function formatDefaultMessage(clientName: string): string {
  return `Hi ${clientName},\n\n`
}

// Handle native SMS on mobile
export async function handleNativeSMS(client: Client, agentName?: string, customMessage?: string): Promise<boolean> {
  try {
    const phone = formatPhoneForSMS(client.phone || client.phone_number || "")

    if (!phone) {
      alert("No phone number available for this client.")
      return false
    }

    // Create message with signature
    const message = customMessage || formatDefaultMessage(client.name)
    const fullMessage = message + getAgentSignature(agentName)

    // Create SMS URI
    const smsURI = `sms:${phone}?body=${encodeURIComponent(fullMessage)}`

    // Log attempt
    await logSMSAttempt(client.id, fullMessage)

    // Open SMS app
    window.open(smsURI, "_self")
    return true
  } catch (error) {
    console.error("Failed to open SMS app:", error)
    return false
  }
}

// Log SMS attempt to Supabase
export async function logSMSAttempt(clientId: string, message: string): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from("sms_logs").insert({
      client_id: clientId,
      agent_id: user.id,
      message: message,
      status: "attempted",
      created_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Failed to log SMS attempt:", error)
  }
}
