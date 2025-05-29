interface Client {
  name: string
  phone: string
  policy_type?: string
  expiry_date?: string
}

/**
 * Formats a custom SMS message with client data
 */
export function formatSMSMessage(client: Client): string {
  const { name, policy_type, expiry_date } = client

  // Default message if policy data is missing
  if (!policy_type || !expiry_date) {
    return `Hi ${name}, this is a reminder about your insurance policy. Please contact us for more details.`
  }

  // Format expiry date to be more readable
  const formattedDate = new Date(expiry_date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return `Hi ${name}, your ${policy_type} policy is expiring on ${formattedDate}. Please renew soon.`
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
 * Opens the native SMS app with pre-filled message
 */
export function openNativeSMS(client: Client): boolean {
  const phone = formatPhoneForSMS(client.phone)
  const message = formatSMSMessage(client)

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
 * Shows appropriate feedback based on device type
 */
export function handleSMSClick(client: Client): void {
  const isMobile = isMobileDevice()

  if (!isMobile) {
    // Desktop fallback
    const phone = formatPhoneForSMS(client.phone)
    const message = formatSMSMessage(client)

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
    // Mobile device - open SMS app
    openNativeSMS(client)
  }
}
