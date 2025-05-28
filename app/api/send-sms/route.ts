import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { to, message } = await request.json()

    // Validate inputs
    if (!to || !message) {
      return NextResponse.json({ success: false, error: "Phone number and message are required" }, { status: 400 })
    }

    // Ensure recipients is an array
    const recipients = Array.isArray(to) ? to : [to]

    // Twilio integration
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      console.error("Twilio credentials missing in environment variables")
      return NextResponse.json({ success: false, error: "Twilio credentials not configured" }, { status: 500 })
    }

    const client = require("twilio")(accountSid, authToken)

    // Send SMS using Twilio
    const results = await Promise.all(
      recipients.map(async (recipient) => {
        try {
          const messageResult = await client.messages.create({
            body: message,
            from: twilioPhoneNumber,
            to: recipient,
          })
          return { success: true, sid: messageResult.sid, to: recipient }
        } catch (error: any) {
          console.error(`Twilio Error for ${recipient}:`, error)
          return { success: false, error: error.message, to: recipient }
        }
      }),
    )

    // Check for any errors
    const errors = results.filter((r) => !r.success)
    if (errors.length > 0) {
      console.error("Twilio SMS sending errors:", errors)
      return NextResponse.json(
        {
          success: false,
          error: `Failed to send SMS to some recipients: ${errors.map((e) => `${e.to} - ${e.error}`).join(", ")}`,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "SMS sent successfully",
      data: results,
    })
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
