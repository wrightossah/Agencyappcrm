import { supabase } from "@/lib/supabase"

interface Policy {
  id: string
  client_id: string
  policy_type: string
  policy_number: string
  start_date: string
  end_date: string
  premium_paid: number
  premium_amount?: number
  commission_rate?: number
  commission_amount?: number
  policy_provider?: string
  status?: string
  description?: string
  is_renewable?: boolean
  active?: boolean
  created_at?: string
}

interface Client {
  name: string
  phone: string
  policy_type?: string
  expiry_date?: string
  id?: string // Added id to Client interface
}

/**
 * Formats a custom SMS message with client and policy data
 */
export function formatSMSMessage(client: Client, policies?: Policy[]): string {
  const { name } = client

  // If we have policy data, create a detailed message
  if (policies && policies.length > 0) {
    // Find the policy that's expiring soonest
    const activePolicies = policies.filter((p) => p.status === "Active" || p.active)

    if (activePolicies.length > 0) {
      const nextExpiringPolicy = activePolicies.reduce((earliest, current) => {
        const earliestDate = new Date(earliest.end_date)
        const currentDate = new Date(current.end_date)
        return currentDate < earliestDate ? current : earliest
      })

      const formattedDate = new Date(nextExpiringPolicy.end_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })

      return `Hi ${name}, your ${nextExpiringPolicy.policy_type} policy is expiring on ${formattedDate}. Please renew soon to maintain coverage. Contact us for assistance.`
    }
  }

  // Enhanced fallback message
  return `Hi ${name}, this is a reminder about your insurance policy. Please contact us to review your coverage and ensure it's up to date.`
}

/**
 * Formats phone number for SMS URI (removes spaces, dashes, etc.)
 */
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

/**
 * Detects if the user is on a mobile device
 */
export function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false

  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

/**
 * Opens the native SMS app with pre-filled message including policy data
 */
export function openNativeSMS(client: Client, policies?: Policy[]): boolean {
  const phone = formatPhoneForSMS(client.phone)
  const message = formatSMSMessage(client, policies)

  if (!phone) {
    alert("No phone number available for this client.")
    return false
  }

  // Create SMS URI
  const smsURI = `sms:${phone}?body=${encodeURIComponent(message)}`

  try {
    // Try to open SMS app
    window.open(smsURI, "_self")
    return true
  } catch (error) {
    console.error("Failed to open SMS app:", error)

    // Fallback: copy message to clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${phone}: ${message}`)
      alert(`SMS app not available. Message copied to clipboard:\n\nTo: ${phone}\nMessage: ${message}`)
    } else {
      alert(`SMS app not available. Please manually send this message:\n\nTo: ${phone}\nMessage: ${message}`)
    }

    return false
  }
}

/**
 * Fetches policies for a client from Supabase
 */
export async function fetchClientPolicies(clientId: string): Promise<Policy[]> {
  try {
    const { data, error } = await supabase
      .from("policies")
      .select("*")
      .eq("client_id", clientId)
      .order("end_date", { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching client policies:", error)
    return []
  }
}

/**
 * Shows appropriate feedback based on device type with policy data
 */
export async function handleSMSClick(client: Client): Promise<void> {
  const isMobile = isMobileDevice()

  // Fetch policy data for more detailed message
  const policies = await fetchClientPolicies(client.id)

  if (!isMobile) {
    // Desktop fallback
    const phone = formatPhoneForSMS(client.phone)
    const message = formatSMSMessage(client, policies)

    if (
      confirm("SMS links work best on mobile devices. Would you like to copy the message to your clipboard instead?")
    ) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(`${phone}: ${message}`)
        alert("Message copied to clipboard!")
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea")
        textArea.value = `${phone}: ${message}`
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)
        alert("Message copied to clipboard!")
      }
    }
  } else {
    // Mobile device - open SMS app with policy data
    openNativeSMS(client, policies)
  }
}
