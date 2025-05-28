// SMS Service using Twilio
export async function sendSMS(phoneNumber: string, message: string) {
  try {
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
    return result
  } catch (error) {
    console.error("SMS Error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
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
    greeting: "Hello {clientName}, this is a message from your insurance agent at AgencyApp.",
    policyReminder: "Hi {clientName}, your policy is due for renewal. Please contact us for details. - AgencyApp",
    thankYou: "Thank you {clientName} for choosing our insurance services. We appreciate your business! - AgencyApp",
    appointment:
      "Hi {clientName}, this is a reminder about your appointment. Please contact us if you need to reschedule. - AgencyApp",
    payment: "Hi {clientName}, your payment is due. Please make your payment to avoid policy lapse. - AgencyApp",
  },
  email: {
    subject: {
      greeting: "Message from Your Insurance Agent - AgencyApp",
      policyReminder: "Policy Renewal Reminder - AgencyApp",
      thankYou: "Thank You for Your Business - AgencyApp",
      appointment: "Appointment Reminder - AgencyApp",
      payment: "Payment Reminder - AgencyApp",
    },
    body: {
      greeting:
        "Dear {clientName},\n\nI hope this message finds you well. I wanted to reach out to you regarding your insurance needs.\n\nBest regards,\nYour Insurance Agent\nAgencyApp",
      policyReminder:
        "Dear {clientName},\n\nThis is a friendly reminder that your insurance policy is approaching its renewal date. Please contact us at your earliest convenience to discuss your renewal options.\n\nBest regards,\nYour Insurance Agent\nAgencyApp",
      thankYou:
        "Dear {clientName},\n\nThank you for choosing our insurance services. We truly appreciate your business and trust in our company.\n\nIf you have any questions or need assistance, please don't hesitate to contact us.\n\nBest regards,\nYour Insurance Agent\nAgencyApp",
      appointment:
        "Dear {clientName},\n\nThis is a reminder about your upcoming appointment with us. Please let us know if you need to reschedule.\n\nBest regards,\nYour Insurance Agent\nAgencyApp",
      payment:
        "Dear {clientName},\n\nThis is a friendly reminder that your insurance payment is due. Please make your payment to avoid any policy lapse.\n\nBest regards,\nYour Insurance Agent\nAgencyApp",
    },
  },
}
