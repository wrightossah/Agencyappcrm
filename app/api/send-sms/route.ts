import { type NextRequest, NextResponse } from "next/server"
import twilio from "twilio"

/**
 * API Route to send SMS using Twilio
 * Follows Next.js App Router API conventions
 */
export async function POST(request: NextRequest) {
  try {
    // Get request body
    const { to, message } = await request.json()

    // Validate required fields
    if (!to || !message) {
      return NextResponse.json({ success: false, error: 'Missing "to" or "message"' }, { status: 400 })
    }

    // Load environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER

    // Validate environment variables
    if (!accountSid || !authToken || !twilioPhone) {
      console.error("Missing Twilio credentials")
      return NextResponse.json({ success: false, error: "Twilio credentials not configured" }, { status: 500 })
    }

    // Initialize Twilio client
    const client = twilio(accountSid, authToken)

    // Send the message
    const msg = await client.messages.create({
      body: message,
      from: twilioPhone,
      to: to,
    })

    // Return success response
    return NextResponse.json({
      success: true,
      sid: msg.sid,
      status: msg.status,
    })
  } catch (error: any) {
    // Handle Twilio specific errors
    console.error("Twilio Error:", error)

    // Provide helpful error messages for common Twilio errors
    let errorMessage = "Failed to send SMS"

    if (error.code === 21211) {
      errorMessage = "Invalid phone number format"
    } else if (error.code === 21608) {
      errorMessage = "The phone number is not verified for trial accounts"
    } else if (error.code === 21614) {
      errorMessage = "Invalid phone number - not a mobile number"
    } else if (error.message) {
      errorMessage = error.message
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        code: error.code,
      },
      { status: 500 },
    )
  }
}
