import { type NextRequest, NextResponse } from "next/server"
import { arkeselSMS } from "@/lib/arkesel-sms"

export async function POST(request: NextRequest) {
  try {
    const { to, message, sender, sandbox = false, scheduleTime } = await request.json()

    // Validate inputs
    if (!to || !message) {
      return NextResponse.json({ success: false, error: "Phone number and message are required" }, { status: 400 })
    }

    // Ensure recipients is an array
    const recipients = Array.isArray(to) ? to : [to]

    // Validate phone numbers
    const invalidNumbers = recipients.filter((num) => !arkeselSMS.validatePhoneNumber(num))
    if (invalidNumbers.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid phone numbers: ${invalidNumbers.join(", ")}`,
        },
        { status: 400 },
      )
    }

    // Send SMS using Arkesel
    const result = await arkeselSMS.sendSMS({
      recipients,
      message,
      sender,
      sandbox,
      scheduleTime,
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        data: result.data,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || result.message,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("SMS API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
