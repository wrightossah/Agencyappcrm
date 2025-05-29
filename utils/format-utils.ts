/**
 * Utility functions for formatting data
 */

/**
 * Formats a phone number for display
 * @param phone The phone number to format
 * @returns Formatted phone number string
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return ""

  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, "")

  // If it already has the country code +233
  if (cleaned.startsWith("+233")) {
    // Format as +233 XX XXX XXXX
    return cleaned.replace(/(\+233)(\d{2})(\d{3})(\d{4})/, "$1 $2 $3 $4")
  }

  // If it starts with 0, replace with +233
  if (cleaned.startsWith("0")) {
    const withCountryCode = "+233" + cleaned.substring(1)
    return withCountryCode.replace(/(\+233)(\d{2})(\d{3})(\d{4})/, "$1 $2 $3 $4")
  }

  // If it's just digits without country code, add +233
  if (/^\d{9}$/.test(cleaned)) {
    const withCountryCode = "+233" + cleaned
    return withCountryCode.replace(/(\+233)(\d{2})(\d{3})(\d{4})/, "$1 $2 $3 $4")
  }

  // Otherwise, return as is
  return phone
}

/**
 * Formats a phone number for SMS (removes formatting)
 * @param phone The phone number to format
 * @returns Clean phone number for SMS
 */
export function formatPhoneForSMS(phone: string): string {
  if (!phone) return ""

  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, "")

  // If it already has the country code
  if (cleaned.startsWith("+233")) {
    return cleaned
  }

  // If it starts with 0, replace with +233
  if (cleaned.startsWith("0")) {
    return "+233" + cleaned.substring(1)
  }

  // If it's just digits without country code, add +233
  if (/^\d{9}$/.test(cleaned)) {
    return "+233" + cleaned
  }

  // If it already starts with +, return as is
  if (cleaned.startsWith("+")) {
    return cleaned
  }

  // Otherwise, assume it needs +233
  return "+233" + cleaned
}

/**
 * Formats currency amount
 * @param amount The amount to format
 * @param currency The currency symbol (default: ₵)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency = "₵"): string {
  if (typeof amount !== "number" || isNaN(amount)) {
    return `${currency}0`
  }

  return `${currency}${amount.toLocaleString()}`
}

/**
 * Formats a date for display
 * @param date The date to format
 * @param options Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  if (!date) return ""

  const dateObj = typeof date === "string" ? new Date(date) : date

  if (isNaN(dateObj.getTime())) {
    return ""
  }

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  }

  return dateObj.toLocaleDateString("en-US", options || defaultOptions)
}

/**
 * Formats a name with proper capitalization
 * @param name The name to format
 * @returns Formatted name string
 */
export function formatName(name: string): string {
  if (!name) return ""

  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

/**
 * Truncates text to a specified length
 * @param text The text to truncate
 * @param maxLength Maximum length before truncation
 * @param suffix Suffix to add when truncated (default: "...")
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number, suffix = "..."): string {
  if (!text || text.length <= maxLength) {
    return text
  }

  return text.substring(0, maxLength - suffix.length) + suffix
}

/**
 * Formats an email address for display
 * @param email The email to format
 * @returns Formatted email string
 */
export function formatEmail(email: string): string {
  if (!email) return ""

  return email.toLowerCase().trim()
}

/**
 * Validates and formats a policy number
 * @param policyNumber The policy number to format
 * @returns Formatted policy number
 */
export function formatPolicyNumber(policyNumber: string): string {
  if (!policyNumber) return ""

  // Remove spaces and convert to uppercase
  return policyNumber.replace(/\s+/g, "").toUpperCase()
}

/**
 * Formats a percentage value
 * @param value The value to format as percentage
 * @param decimals Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals = 1): string {
  if (typeof value !== "number" || isNaN(value)) {
    return "0%"
  }

  return `${value.toFixed(decimals)}%`
}
