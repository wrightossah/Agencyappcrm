"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { X, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"

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
  const [charCount, setCharCount] = useState(0)
  const { toast } = useToast()
  const { profile } = useAuth()

  useEffect(() => {
    if (isOpen && client) {
      setMessage(`Hi ${client.name},\n\n`)
    }
  }, [isOpen, client])

  useEffect(() => {
    setCharCount(message.length)
  }, [message])

  const getSignature = () => {
    if (profile?.full_name) {
      return `\n\nRegards,\n${profile.full_name}`
    }
    return `\n\nRegards,\nYour Insurance Agent`
  }

  const handleSendSMS = () => {
    if (!client || !message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      })
      return
    }

    try {
      const fullMessage = message + getSignature()
      const phone = formatPhoneForSMS(client.phone || client.phone_number || "")

      if (!phone) {
        toast({
          title: "Error",
          description: "No valid phone number for this client",
          variant: "destructive",
        })
        return
      }

      // Create SMS URI and open native SMS app
      const smsURI = `sms:${phone}?body=${encodeURIComponent(fullMessage)}`
      window.open(smsURI, "_self")

      toast({
        title: "SMS App Opened",
        description: `Message prepared for ${client.name}`,
      })

      onClose()
    } catch (error: any) {
      console.error("SMS Error:", error)
      toast({
        title: "SMS Failed",
        description: "Failed to open SMS app",
        variant: "destructive",
      })
    }
  }

  const formatPhoneForSMS = (phone: string): string => {
    if (!phone) return ""

    let cleaned = phone.replace(/[^\d+]/g, "")

    if (cleaned.startsWith("0")) {
      cleaned = "+233" + cleaned.substring(1)
    }

    if (!cleaned.startsWith("+")) {
      cleaned = "+233" + cleaned
    }

    return cleaned
  }

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return ""

    if (phone.startsWith("+233")) {
      return phone.replace(/(\+233)(\d{2})(\d{3})(\d{4})/, "$1 $2 $3 $4")
    }

    if (phone.startsWith("0")) {
      const withCountryCode = "+233" + phone.substring(1)
      return withCountryCode.replace(/(\+233)(\d{2})(\d{3})(\d{4})/, "$1 $2 $3 $4")
    }

    return phone
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
            <p>Your signature will be automatically added. This will open your device's SMS app.</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSendSMS} disabled={!message.trim()}>
            <Send className="mr-2 h-4 w-4" />
            Open SMS App
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
