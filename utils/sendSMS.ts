/**
 * Utility function to send SMS using Twilio
 * @param phoneNumber - The recipient's phone number (will be formatted if needed)
 * @param message - The SMS message content
 * @returns Promise with the result of the SMS operation
 */
export const sendSMS = async (phoneNumber: string, message: string) => {
  try {
    // Format phone number if needed
    const formattedPhone = formatPhoneNumber(phoneNumber)

    const response = await fetch("/api/send-sms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ to: formattedPhone, message }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || "Failed to send SMS")
    }

    return { success: true, data: result }
  } catch (error) {
    console.error("SMS Error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Formats phone numbers to international format for Ghana
 * @param phone - The phone number to format
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "")

  // Format for Ghana numbers
  if (digits.startsWith("0") && digits.length === 10) {
    return "+233" + digits.substring(1)
  } else if (digits.startsWith("233") && digits.length === 12) {
    return "+" + digits
  } else if (digits.length === 9) {
    return "+233" + digits
  }

  // If already has + or other format, return as is
  return phone
}
