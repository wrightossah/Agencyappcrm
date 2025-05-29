export interface ClientEmailData {
  id: string
  name: string
  email: string
  policy_type?: string
  expiry_date?: string
}

/**
 * Formats the email body with client-specific information
 */
export function formatEmailBody(client: ClientEmailData): string {
  const clientName = client.name || "Valued Client"
  const policyType = client.policy_type || "insurance"
  const expiryDate = client.expiry_date ? formatDate(client.expiry_date) : "soon"

  return `Hi ${clientName},

Your ${policyType} policy is expiring on ${expiryDate}. Please contact us to renew it promptly.

Best regards,
AGENCYAPP Team`
}

/**
 * Formats date for display in email
 */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch (error) {
    return dateString
  }
}

/**
 * Creates a mailto URL with pre-filled content
 */
export function createMailtoUrl(client: ClientEmailData): string {
  const to = encodeURIComponent(client.email || "")
  const subject = encodeURIComponent("Policy Renewal Reminder")
  const body = encodeURIComponent(formatEmailBody(client))

  return `mailto:${to}?subject=${subject}&body=${body}`
}

/**
 * Detects if the device likely has a mail client
 */
export function hasMailClient(): boolean {
  // Check if we're on mobile (more likely to have mail client)
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  // Check if we're on macOS (likely has Mail app)
  const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform)

  // Check if we're on Windows (might have Outlook)
  const isWindows = /Win/.test(navigator.platform)

  return isMobile || isMac || isWindows
}

/**
 * Attempts to open email client and provides fallback
 */
export function handleEmailClick(client: ClientEmailData): void {
  if (!client.email) {
    alert("No email address available for this client.")
    return
  }

  const mailtoUrl = createMailtoUrl(client)

  try {
    // Create a temporary link and click it
    const link = document.createElement("a")
    link.href = mailtoUrl
    link.style.display = "none"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Show fallback message after a short delay if no mail client opens
    setTimeout(() => {
      if (!hasMailClient()) {
        showEmailFallback(client)
      }
    }, 1000)
  } catch (error) {
    console.error("Error opening email client:", error)
    showEmailFallback(client)
  }
}

/**
 * Shows fallback options when mail client isn't available
 */
function showEmailFallback(client: ClientEmailData): void {
  const emailContent = `To: ${client.email}
Subject: Policy Renewal Reminder

${formatEmailBody(client)}`

  if (navigator.clipboard && window.isSecureContext) {
    // Copy to clipboard if available
    navigator.clipboard
      .writeText(emailContent)
      .then(() => {
        alert(`Email content copied to clipboard! Please paste it into your email client.

To: ${client.email}
Subject: Policy Renewal Reminder`)
      })
      .catch(() => {
        showManualCopyFallback(emailContent)
      })
  } else {
    showManualCopyFallback(emailContent)
  }
}

/**
 * Shows manual copy fallback
 */
function showManualCopyFallback(emailContent: string): void {
  const message = `Please copy the following email content and paste it into your email client:

${emailContent}`

  // Create a text area for easy copying
  const textArea = document.createElement("textarea")
  textArea.value = emailContent
  textArea.style.position = "fixed"
  textArea.style.left = "-999999px"
  textArea.style.top = "-999999px"
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()

  try {
    document.execCommand("copy")
    alert("Email content copied to clipboard! Please paste it into your email client.")
  } catch (err) {
    alert(message)
  }

  document.body.removeChild(textArea)
}

/**
 * Gets tooltip text based on device capabilities
 */
export function getEmailTooltip(): string {
  if (hasMailClient()) {
    return "Send email via your default email app"
  }
  return "Copy email content to clipboard (no email app detected)"
}
