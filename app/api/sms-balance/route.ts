import { type NextRequest, NextResponse } from "next/server"
import { arkeselSMS } from "@/lib/arkesel-sms"

export async function GET(request: NextRequest) {
  try {
    const result = await arkeselSMS.getBalance()

    if (result.success) {
      return NextResponse.json({
        success: true,
        balance: result.balance,
        currency: result.currency,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("SMS Balance API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch SMS balance",
      },
      { status: 500 },
    )
  }
}
