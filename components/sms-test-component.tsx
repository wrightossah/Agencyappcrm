"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Send, TestTube, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function SMSTestComponent() {
  const { toast } = useToast()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [message, setMessage] = useState("Hello! This is a test message from AgencyApp.")
  const [sandboxMode, setSandboxMode] = useState(true)
  const [sending, setSending] = useState(false)
  const [balance, setBalance] = useState<{ balance: number; currency: string } | null>(null)
  const [loadingBalance, setLoadingBalance] = useState(false)

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
          sandbox: sandboxMode,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "SMS Sent Successfully",
          description: sandboxMode
            ? "Test SMS sent in sandbox mode (no actual SMS delivered)"
            : "SMS sent successfully to " + phoneNumber,
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

  const handleCheckBalance = async () => {
    setLoadingBalance(true)

    try {
      const response = await fetch("/api/sms-balance")
      const result = await response.json()

      if (result.success) {
        setBalance({
          balance: result.balance,
          currency: result.currency,
        })
        toast({
          title: "Balance Updated",
          description: `Current balance: ${result.balance} ${result.currency}`,
        })
      } else {
        throw new Error(result.error || "Failed to fetch balance")
      }
    } catch (error) {
      console.error("Balance Error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch balance",
        variant: "destructive",
      })
    } finally {
      setLoadingBalance(false)
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
        {/* Balance Display */}
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">SMS Balance</Label>
            {balance ? (
              <p className="text-lg font-bold">
                {balance.balance} {balance.currency}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Click to check balance</p>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={handleCheckBalance} disabled={loadingBalance}>
            {loadingBalance ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check Balance"}
          </Button>
        </div>

        {/* Sandbox Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium">Sandbox Mode</Label>
            <p className="text-xs text-muted-foreground">Test without sending real SMS</p>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={sandboxMode} onCheckedChange={setSandboxMode} />
            <Badge variant={sandboxMode ? "secondary" : "default"}>{sandboxMode ? "Test" : "Live"}</Badge>
          </div>
        </div>

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

        {/* Warning for Live Mode */}
        {!sandboxMode && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-xs text-yellow-800">
              ⚠️ <strong>Live Mode:</strong> This will send an actual SMS and consume credits.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
