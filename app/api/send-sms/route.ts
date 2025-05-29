import { type NextRequest, NextResponse } from "next/server"
import twilio from "twilio"
import { createClient } from "@/lib/supabase"

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10 // 10 SMS per minute

// In-memory rate limiting (would use Redis in production)
const rateLimitStore: Record<string, { count: number; resetAt: number }> = {}

/**
 * Enhanced SMS sending API with rate limiting, validation, and detailed error handling
 */
export async function POST(request: NextRequest) {
  try {
    // Get request body
    const { to, message, metadata = {} } = await request.json()

    // Validate inputs
    if (!to || !message) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing "to" or "message"',
          errorCode: "VALIDATION_ERROR",
        },
        { status: 400 },
      )
    }

    // Check message length
    if (message.length > 1600) {
      return NextResponse.json(
        {
          success: false,
          error: "Message too long. Maximum length is 1600 characters.",
          errorCode: "MESSAGE_TOO_LONG",
        },
        { status: 400 },
      )
    }

    // Apply rate limiting
    const ip = request.ip || "unknown"
    const now = Date.now()

    if (!rateLimitStore[ip] || rateLimitStore[ip].resetAt < now) {
      rateLimitStore[ip] = { count: 0, resetAt: now + RATE_LIMIT_WINDOW }
    }

    rateLimitStore[ip].count++

    if (rateLimitStore[ip].count > MAX_REQUESTS_PER_WINDOW) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded. Please try again later.",
          errorCode: "RATE_LIMIT_EXCEEDED",
        },
        { status: 429 },
      )
    }

    // Load environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER

    // Validate environment variables
    if (!accountSid || !authToken || !twilioPhone) {
      console.error("Missing Twilio credentials")
      return NextResponse.json(
        {
          success: false,
          error: "Twilio credentials not configured properly",
          errorCode: "CONFIGURATION_ERROR",
        },
        { status: 500 },
      )
    }

    // Initialize Twilio client
    const client = twilio(accountSid, authToken)

    // Log the SMS attempt before sending
    const supabase = createClient()
    await supabase.rpc("create_sms_logs_if_not_exists")

    const logEntry = {
      recipient: to,
      message: message,
      status: "pending" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      retryCount: metadata.retryCount || 0,
      metadata: metadata,
    }

    const { data: logData, error: logError } = await supabase.from("sms_logs").insert([logEntry]).select()

    if (logError) {
      console.error("Failed to log SMS attempt:", logError)
    }

    const logId = logData?.[0]?.id

    // Send the message
    const msg = await client.messages.create({
      body: message,
      from: twilioPhone,
      to: to,
      statusCallback: `${process.env.PROJECT_URL}/api/sms-status-callback?logId=${logId}`,
    })

    // Update the log with the message ID and status
    if (logId) {
      await supabase
        .from("sms_logs")
        .update({
          messageId: msg.sid,
          status: msg.status || "sent",
          updatedAt: new Date().toISOString(),
        })
        .eq("id", logId)
    }

    // Return success response
    return NextResponse.json({
      success: true,
      sid: msg.sid,
      status: msg.status,
    })
  } catch (error: any) {
    // Handle Twilio specific errors
    console.error("Twilio Error:", error)

    // Map common Twilio error codes to user-friendly messages
    const errorMessages: Record<string, string> = {
      // Authentication errors
      20003: "Authentication error. Check your Twilio credentials.",
      20404: "The requested resource was not found.",
      20429: "Too many requests. Please try again later.",

      // Phone number errors
      21211: "Invalid phone number format.",
      21214: "Phone number is not a valid mobile number.",
      21608: "The phone number is not verified for trial accounts.",
      21610: "This number is not enabled for the specified capability.",
      21612: "The phone number is not reachable.",
      21614: "Invalid phone number - not a mobile number.",

      // Message errors
      21610: "Message cannot be sent to this number.",
      21611: "This number is not currently reachable via SMS.",
      30001: "Message queue is full.",
      30002: "Message body is too large.",
      30003: "Message contains invalid characters.",
      30004: "Message is flagged as spam.",
      30005: "Message contains invalid links.",
      30006: "Message contains prohibited content.",
      30007: "Message sending failed.",
    }

    const errorMessage = errorMessages[error.code] || error.message || "Failed to send SMS"

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        errorCode: error.code || "UNKNOWN_ERROR",
        details: error.moreInfo || error.detail || undefined,
      },
      { status: error.status || 500 },
    )
  }
}
