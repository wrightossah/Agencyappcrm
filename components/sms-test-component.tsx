"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Send, TestTube, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function SMSTestComponent() {
  const { toast } = useToast()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [message, setMessage] = useState("Hello! This is a test message from AgencyApp.")
  const [sending, setSending] = useState(false)

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

      const result = await response.json()

      if (result.success) {
        toast({
          title: "SMS Sent Successfully",
          description: "SMS sent successfully to " + phoneNumber,
        })
      } else {
        throw new Error(result.error || "Failed to send SMS")
      }
    } catch (error) {
      console.error("SMS Test Error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send SMS",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  return (
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
          <p className="text-xs text-muted-foreground">Ghana phone numbers only</p>
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
      </CardContent>
    </Card>
  )
}
