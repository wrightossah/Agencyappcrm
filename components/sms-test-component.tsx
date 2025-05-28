"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Send, TestTube, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { sendSMS, formatPhoneNumber } from "@/utils/sendSMS"

export function SMSTestComponent() {
  const { toast } = useToast()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [message, setMessage] = useState("Hello! This is a test message from AgencyApp.")
  const [sending, setSending] = useState(false)
  const [lastResult, setLastResult] = useState<any>(null)

  const handleSendTest = async () => {
    if (!phoneNumber.trim() || !message.trim()) {
      toast({
        title: "Error",
        description: "Please enter both phone number and message.",
        variant: "destructive",
      })
      return
    }

    setSending(true)
    setLastResult(null)

    try {
      // Use the utility function to send SMS
      const result = await sendSMS(phoneNumber, message)
      setLastResult(result)

      if (result.success) {
        toast({
          title: "SMS Sent Successfully",
          description: `SMS sent to ${formatPhoneNumber(phoneNumber)}`,
        })
      } else {
        throw new Error(result.error || "Failed to send SMS")
      }
    } catch (error) {
      console.error("SMS Test Error:", error)
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send SMS",
      }
      setLastResult(errorResult)

      toast({
        title: "Error",
        description: errorResult.error,
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            SMS Test Component
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Phone Number Input */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="0XX XXX XXXX or +233XX XXX XXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Will be formatted as: {phoneNumber ? formatPhoneNumber(phoneNumber) : "+233XXXXXXXXX"}
            </p>
          </div>

          {/* Message Input */}
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Enter your test message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">{message.length}/160 characters</p>
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSendTest}
            disabled={sending || !phoneNumber.trim() || !message.trim()}
            className="w-full"
          >
            {sending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Test SMS
              </>
            )}
          </Button>

          {/* Twilio Credentials Info */}
          <div className="rounded-md bg-muted p-3 text-xs">
            <p className="font-medium">🛡️ Twilio Credentials</p>
            <p className="mt-1 text-muted-foreground">
              Make sure your Twilio credentials are set in environment variables:
            </p>
            <ul className="mt-1 list-disc pl-4 text-muted-foreground">
              <li>TWILIO_ACCOUNT_SID</li>
              <li>TWILIO_AUTH_TOKEN</li>
              <li>TWILIO_PHONE_NUMBER</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Result Display */}
      {lastResult && (
        <Alert className={lastResult.success ? "border-green-500" : "border-red-500"}>
          {lastResult.success ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
          <AlertDescription>
            {lastResult.success ? (
              <div>
                <p className="font-medium text-green-700">SMS sent successfully!</p>
                {lastResult.data && (
                  <div className="mt-2 text-sm text-green-600">
                    <p>Message ID: {lastResult.data.sid}</p>
                    <p>Status: {lastResult.data.status}</p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p className="font-medium text-red-700">Failed to send SMS</p>
                <p className="text-sm text-red-600">{lastResult.error}</p>
                {lastResult.code && <p className="text-sm text-red-600">Error code: {lastResult.code}</p>}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
