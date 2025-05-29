import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

/**
 * Webhook endpoint for Twilio SMS status callbacks
 * Updates the SMS log with the latest status
 */
export async function POST(request: NextRequest) {
  try {
    // Parse form data from Twilio
    const formData = await request.formData()

    const messageId = formData.get("MessageSid") as string
    const status = formData.get("MessageStatus") as string
    const to = formData.get("To") as string
    const from = formData.get("From") as string
    const errorCode = formData.get("ErrorCode") as string
    const errorMessage = formData.get("ErrorMessage") as string

    // Get the log ID from the query string
    const url = new URL(request.url)
    const logId = url.searchParams.get("logId")

    console.log("SMS Status Update:", {
      messageId,
      status,
      to,
      from,
      errorCode,
      errorMessage,
      logId,
    })

    // Update the SMS log in the database
    const supabase = createClient()

    if (logId) {
      // Update by log ID if available
      await supabase
        .from("sms_logs")
        .update({
          status,
          errorCode: errorCode || undefined,
          errorMessage: errorMessage || undefined,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", logId)
    } else if (messageId) {
      // Fall back to updating by message ID
      await supabase
        .from("sms_logs")
        .update({
          status,
          errorCode: errorCode || undefined,
          errorMessage: errorMessage || undefined,
          updatedAt: new Date().toISOString(),
        })
        .eq("messageId", messageId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing SMS status callback:", error)
    return NextResponse.json({ success: false, error: "Failed to process status update" }, { status: 500 })
  }
}
