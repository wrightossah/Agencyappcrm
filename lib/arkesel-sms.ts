interface ArkeselSMSResponse {
  success: boolean
  message: string
  data?: any
  error?: string
}

interface ArkeselBalanceResponse {
  success: boolean
  balance?: number
  currency?: string
  error?: string
}

interface SendSMSParams {
  recipients: string[]
  message: string
  sender?: string
  sandbox?: boolean
  scheduleTime?: string
}

class ArkeselSMSService {
  private apiKey: string
  private baseUrl: string
  private defaultSender: string
  private apiVersion: string

  constructor() {
    this.apiKey = process.env.ARKESEL_SMS_API_KEY || ""
    this.baseUrl = "https://sms.arkesel.com"
    this.defaultSender = process.env.ARKESEL_SMS_SENDER || "AgencyApp"
    this.apiVersion = process.env.ARKESEL_API_VERSION || "v2"
  }

  private async makeRequest(endpoint: string, data?: any): Promise<any> {
    try {
      const url = `${this.baseUrl}/api/${this.apiVersion}/${endpoint}`

      const options: RequestInit = {
        method: data ? "POST" : "GET",
        headers: {
          "api-key": this.apiKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }

      if (data) {
        options.body = JSON.stringify(data)
      }

      const response = await fetch(url, options)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Arkesel API Error:", error)
      throw error
    }
  }

  async sendSMS({
    recipients,
    message,
    sender,
    sandbox = false,
    scheduleTime,
  }: SendSMSParams): Promise<ArkeselSMSResponse> {
    try {
      // Validate inputs
      if (!recipients || recipients.length === 0) {
        return {
          success: false,
          message: "Recipients are required",
          error: "No recipients provided",
        }
      }

      if (!message || message.trim().length === 0) {
        return {
          success: false,
          message: "Message content is required",
          error: "Empty message",
        }
      }

      // Format recipients to ensure they start with country code
      const formattedRecipients = recipients.map((recipient) => {
        let formatted = recipient.replace(/\s+/g, "").replace(/[^\d+]/g, "")

        // If it starts with 0, replace with +233
        if (formatted.startsWith("0")) {
          formatted = "+233" + formatted.substring(1)
        }

        // If it doesn't start with +, add +233
        if (!formatted.startsWith("+")) {
          formatted = "+233" + formatted
        }

        return formatted
      })

      const payload: any = {
        sender: sender || this.defaultSender,
        message: message,
        recipients: formattedRecipients,
        sandbox: sandbox,
      }

      // Add schedule time if provided
      if (scheduleTime) {
        payload.schedule_time = scheduleTime
      }

      console.log("Sending SMS with payload:", payload)

      const response = await this.makeRequest("sms/send", payload)

      return {
        success: true,
        message: "SMS sent successfully",
        data: response,
      }
    } catch (error) {
      console.error("Error sending SMS:", error)
      return {
        success: false,
        message: "Failed to send SMS",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async getBalance(): Promise<ArkeselBalanceResponse> {
    try {
      const response = await this.makeRequest("sms/balance")

      return {
        success: true,
        balance: response.balance,
        currency: response.currency || "GHS",
      }
    } catch (error) {
      console.error("Error getting balance:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async scheduleSMS({
    recipients,
    message,
    sender,
    scheduleTime,
    sandbox = false,
  }: SendSMSParams & { scheduleTime: string }): Promise<ArkeselSMSResponse> {
    return this.sendSMS({
      recipients,
      message,
      sender,
      sandbox,
      scheduleTime,
    })
  }

  // Utility method to validate phone numbers
  validatePhoneNumber(phoneNumber: string): boolean {
    // Remove all non-digit characters except +
    const cleaned = phoneNumber.replace(/[^\d+]/g, "")

    // Check if it's a valid Ghana phone number
    const ghanaPattern = /^(\+233|233|0)[2-9]\d{8}$/

    return ghanaPattern.test(cleaned)
  }

  // Format phone number for display
  formatPhoneNumber(phoneNumber: string): string {
    const cleaned = phoneNumber.replace(/[^\d+]/g, "")

    if (cleaned.startsWith("+233")) {
      return cleaned.replace(/(\+233)(\d{2})(\d{3})(\d{4})/, "$1 $2 $3 $4")
    }

    if (cleaned.startsWith("233")) {
      return cleaned.replace(/(233)(\d{2})(\d{3})(\d{4})/, "+$1 $2 $3 $4")
    }

    if (cleaned.startsWith("0")) {
      const withCountryCode = "+233" + cleaned.substring(1)
      return withCountryCode.replace(/(\+233)(\d{2})(\d{3})(\d{4})/, "$1 $2 $3 $4")
    }

    return phoneNumber
  }
}

// Export singleton instance
export const arkeselSMS = new ArkeselSMSService()

// Export types
export type { ArkeselSMSResponse, ArkeselBalanceResponse, SendSMSParams }
