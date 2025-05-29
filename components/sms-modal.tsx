"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { X, Send, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { formatPhoneNumber } from "@/utils/format-utils"

interface SMSModalProps {
  isOpen: boolean
  onClose: () => void
  client: {
    id: string
    name: string
    phone: string
    phone_number?: string
  } | null
}

export function SMSModal({ isOpen, onClose, client }: SMSModalProps) {
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [charCount, setCharCount] = useState(0)
  const { toast } = useToast()
  const { user, profile } = useAuth()

  // Reset message when modal opens with new client
  useEffect(() => {
    if (isOpen && client) {
      // Default message template
      setMessage(`Hi ${client.name},\n\n`)
    }
  }, [isOpen, client])

  // Update character count
  useEffect(() => {
    setCharCount(message.length)
  }, [message])

  // Get agent signature
  const getSignature = () => {
    if (profile?.full_name) {
      return `\n\nRegards,\n${profile.full_name}`
    }
    return `\n\nRegards,\nYour Insurance Agent`
  }

  // Handle sending SMS
  const handleSendSMS = async () => {
    if (!client || !message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      })
      return
    }

    setSending(true)

    try {
      // Add signature to message
      const fullMessage = message + getSignature()

      // Log SMS attempt to Supabase
      await logSMSAttempt(client.id, fullMessage)

      // Format phone number
      const phone = client.phone || client.phone_number || ""
      const formattedPhone = formatPhoneForSMS(phone)

      // Send SMS via API
      const response = await fetch("/api/send-sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: formattedPhone,
          message: fullMessage,
          metadata: {
            clientId: client.id,
            agentId: user?.id,
          },
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "SMS Sent",
          description: `Message sent to ${client.name}`,
        })
        onClose()
      } else {
        throw new Error(result.error || "Failed to send SMS")
      }
    } catch (error: any) {
      console.error("SMS Error:", error)
      toast({
        title: "SMS Failed",
        description: error.message || "Failed to send SMS",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  // Log SMS attempt to Supabase
  const logSMSAttempt = async (clientId: string, message: string) => {
    try {
      if (!user) return

      await supabase.from("sms_logs").insert({
        client_id: clientId,
        agent_id: user.id,
        message: message,
        status: "attempted",
        created_at: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Failed to log SMS attempt:", error)
    }
  }

  // Format phone number for SMS
  const formatPhoneForSMS = (phone: string): string => {
    if (!phone) return ""

    // Remove all non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, "")

    // If it starts with 0, replace with +233 (Ghana country code)
    if (cleaned.startsWith("0")) {
      cleaned = "+233" + cleaned.substring(1)
    }

    // If it doesn't start with +, add +233
    if (!cleaned.startsWith("+")) {
      cleaned = "+233" + cleaned
    }

    return cleaned
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Send SMS to {client?.name}</span>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone Number</label>
            <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
              {client ? formatPhoneNumber(client.phone || client.phone_number || "") : ""}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Message</label>
              <span className={`text-xs ${charCount > 160 ? "text-amber-500" : "text-muted-foreground"}`}>
                {charCount}/160 {charCount > 160 ? `(${Math.ceil(charCount / 160)} SMS)` : ""}
              </span>
            </div>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="min-h-[120px]"
            />
          </div>

          <div className="text-xs text-muted-foreground">
            <p>Your name will be automatically added as a signature.</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={sending}>
            Cancel
          </Button>
          <Button onClick={handleSendSMS} disabled={!message.trim() || sending}>
            {sending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send SMS
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
