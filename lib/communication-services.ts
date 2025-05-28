// SMS Service using Twilio (you'll need to add Twilio credentials to environment variables)
export async function sendSMS(phoneNumber: string, message: string) {
  try {
    // This would typically call your backend API that handles Twilio
    const response = await fetch("/api/send-sms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: phoneNumber,
        message: message,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to send SMS")
    }

    const result = await response.json()
    return { success: true, data: result }
  } catch (error) {
    console.error("SMS Error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// Email Service using EmailJS or similar
export async function sendEmail(to: string, subject: string, message: string, clientName: string) {
  try {
    // This would typically use EmailJS or your email service
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: to,
        subject: subject,
        message: message,
        clientName: clientName,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to send email")
    }

    const result = await response.json()
    return { success: true, data: result }
  } catch (error) {
    console.error("Email Error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// Default message templates
export const messageTemplates = {
  sms: {
    greeting: "Hello {clientName}, this is a message from your insurance agent.",
    policyReminder: "Hi {clientName}, your policy is due for renewal. Please contact us for details.",
    thankYou: "Thank you {clientName} for choosing our insurance services. We appreciate your business!",
  },
  email: {
    subject: {
      greeting: "Message from Your Insurance Agent",
      policyReminder: "Policy Renewal Reminder",
      thankYou: "Thank You for Your Business",
    },
    body: {
      greeting:
        "Dear {clientName},\n\nI hope this message finds you well. I wanted to reach out to you regarding your insurance needs.\n\nBest regards,\nYour Insurance Agent",
      policyReminder:
        "Dear {clientName},\n\nThis is a friendly reminder that your insurance policy is approaching its renewal date. Please contact us at your earliest convenience to discuss your renewal options.\n\nBest regards,\nYour Insurance Agent",
      thankYou:
        "Dear {clientName},\n\nThank you for choosing our insurance services. We truly appreciate your business and trust in our company.\n\nIf you have any questions or need assistance, please don't hesitate to contact us.\n\nBest regards,\nYour Insurance Agent",
    },
  },
}
