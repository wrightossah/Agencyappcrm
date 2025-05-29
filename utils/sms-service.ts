import { createClient } from "@/lib/supabase"

// SMS Status types
export type SMSStatus = "pending" | "sent" | "delivered" | "failed" | "undelivered"

// SMS Result interface
export interface SMSResult {
  success: boolean
  messageId?: string
  status?: SMSStatus
  to?: string
  error?: string
  errorCode?: string
  timestamp?: number
  retryCount?: number
}

// SMS Log interface for storing in database
export interface SMSLog {
  id?: string
  recipient: string
  message: string
  status: SMSStatus
  messageId?: string
  errorMessage?: string
  errorCode?: string
  createdAt: string
  updatedAt: string
  retryCount: number
  metadata?: Record<string, any>
}

/**
 * Comprehensive SMS service with retries, validation and logging
 */
export class SMSService {
  private maxRetries = 2
  private retryDelay = 1000 // ms

  /**
   * Send SMS with retry capability and logging
   */
  async sendSMS(
    phoneNumber: string,
    message: string,
    options: {
      retries?: number
      metadata?: Record<string, any>
      logToDatabase?: boolean
    } = {},
  ): Promise<SMSResult> {
    const { retries = this.maxRetries, metadata = {}, logToDatabase = true } = options

    // Format and validate phone number
    const formattedPhone = this.formatPhoneNumber(phoneNumber)
    const validationResult = this.validatePhoneNumber(formattedPhone)

    if (!validationResult.isValid) {
      const result: SMSResult = {
        success: false,
        error: validationResult.error,
        errorCode: "VALIDATION_ERROR",
        timestamp: Date.now(),
      }

      if (logToDatabase) {
        await this.logSMSAttempt({
          recipient: formattedPhone,
          message,
          status: "failed",
          errorMessage: validationResult.error,
          errorCode: "VALIDATION_ERROR",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          retryCount: 0,
          metadata,
        })
      }

      return result
    }

    // Try to send SMS with retries
    let lastError: any = null
    let retryCount = 0

    while (retryCount <= retries) {
      try {
        // If not first attempt, wait before retry
        if (retryCount > 0) {
          await new Promise((resolve) => setTimeout(resolve, this.retryDelay * retryCount))
          console.log(`Retrying SMS to ${formattedPhone} (Attempt ${retryCount + 1}/${retries + 1})`)
        }

        const response = await fetch("/api/send-sms", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: formattedPhone,
            message,
            metadata: {
              ...metadata,
              retryCount,
            },
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Failed to send SMS")
        }

        // Success - log and return
        const successResult: SMSResult = {
          success: true,
          messageId: result.sid,
          status: result.status || "sent",
          to: formattedPhone,
          timestamp: Date.now(),
          retryCount,
        }

        if (logToDatabase) {
          await this.logSMSAttempt({
            recipient: formattedPhone,
            message,
            status: successResult.status as SMSStatus,
            messageId: successResult.messageId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            retryCount,
            metadata,
          })
        }

        return successResult
      } catch (error: any) {
        lastError = error
        retryCount++

        // If this was the last retry, break out of the loop
        if (retryCount > retries) {
          break
        }

        // Check if error is retryable
        if (!this.isRetryableError(error)) {
          break
        }
      }
    }

    // All retries failed
    const failureResult: SMSResult = {
      success: false,
      error: lastError?.message || "Failed to send SMS after retries",
      errorCode: lastError?.code,
      to: formattedPhone,
      timestamp: Date.now(),
      retryCount,
    }

    if (logToDatabase) {
      await this.logSMSAttempt({
        recipient: formattedPhone,
        message,
        status: "failed",
        errorMessage: failureResult.error,
        errorCode: failureResult.errorCode,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        retryCount: retryCount - 1,
        metadata,
      })
    }

    return failureResult
  }

  /**
   * Format phone numbers to international format
   * Handles various input formats
   */
  formatPhoneNumber(phone: string): string {
    if (!phone) return ""

    // Remove all non-digit characters except +
    const cleaned = phone.replace(/[^\d+]/g, "")

    // If already has international format with +, return as is
    if (cleaned.startsWith("+")) {
      return cleaned
    }

    // Handle Ghana numbers
    if (cleaned.startsWith("0") && cleaned.length === 10) {
      // Convert 0XXXXXXXXX to +233XXXXXXXXX
      return "+233" + cleaned.substring(1)
    } else if (cleaned.startsWith("233") && cleaned.length === 12) {
      // Convert 233XXXXXXXXX to +233XXXXXXXXX
      return "+" + cleaned
    } else if (!cleaned.startsWith("0") && !cleaned.startsWith("233") && cleaned.length === 9) {
      // Convert XXXXXXXXX to +233XXXXXXXXX
      return "+233" + cleaned
    }

    // For other countries, assume it needs a + prefix if it's a reasonable length
    if (cleaned.length >= 10 && cleaned.length <= 15) {
      return "+" + cleaned
    }

    // Return as is if we can't determine the format
    return phone
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phone: string): { isValid: boolean; error?: string } {
    if (!phone) {
      return { isValid: false, error: "Phone number is required" }
    }

    // Basic validation for international format
    if (!phone.startsWith("+")) {
      return { isValid: false, error: "Phone number must start with +" }
    }

    // Check length (international numbers vary, but should be reasonable)
    const digits = phone.replace(/\D/g, "")
    if (digits.length < 10 || digits.length > 15) {
      return { isValid: false, error: "Phone number must be between 10 and 15 digits" }
    }

    // For Ghana numbers, validate country code
    if (phone.startsWith("+233")) {
      if (phone.length !== 13) {
        return { isValid: false, error: "Ghana numbers must be 9 digits after the +233 prefix" }
      }
    }

    return { isValid: true }
  }

  /**
   * Determine if an error is retryable
   */
  isRetryableError(error: any): boolean {
    // Network errors are retryable
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      return true
    }

    // Twilio rate limiting errors are retryable
    if (error.code === 20429 || error.code === 20003) {
      return true
    }

    // Server errors (5xx) are retryable
    if (error.status && error.status >= 500 && error.status < 600) {
      return true
    }

    // Default to not retryable for other errors
    return false
  }

  /**
   * Log SMS attempt to database
   */
  async logSMSAttempt(log: SMSLog): Promise<void> {
    try {
      const supabase = createClient()

      // Create SMS logs table if it doesn't exist
      // This would normally be done in a migration, but for simplicity
      await supabase.rpc("create_sms_logs_if_not_exists")

      // Insert log entry
      const { error } = await supabase.from("sms_logs").insert([log])

      if (error) {
        console.error("Failed to log SMS attempt:", error)
      }
    } catch (error) {
      console.error("Error logging SMS attempt:", error)
    }
  }

  /**
   * Get SMS logs for a specific recipient
   */
  async getSMSLogs(recipient?: string, limit = 50): Promise<SMSLog[]> {
    try {
      const supabase = createClient()

      let query = supabase.from("sms_logs").select("*").order("createdAt", { ascending: false }).limit(limit)

      if (recipient) {
        query = query.eq("recipient", this.formatPhoneNumber(recipient))
      }

      const { data, error } = await query

      if (error) {
        console.error("Failed to get SMS logs:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Error getting SMS logs:", error)
      return []
    }
  }
}

// Export singleton instance
export const smsService = new SMSService()

// Simple export for the most common use case
export const sendSMS = (to: string, message: string, options?: any) => {
  return smsService.sendSMS(to, message, options)
}
