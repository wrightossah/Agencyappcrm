"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { X, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"

interface EmailModalProps {
  isOpen: boolean
  onClose: () => void
  client: {
    id: string
    name: string
    email: string
  } | null
}

export function EmailModal({ isOpen, onClose, client }: EmailModalProps) {
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const { toast } = useToast()
  const { profile } = useAuth()

  useEffect(() => {
    if (isOpen && client) {
      setSubject("Insurance Policy Update")
      setMessage(`Dear ${client.name},\n\n`)
    }
  }, [isOpen, client])

  const getSignature = () => {
    if (profile?.full_name) {
      return `\n\nBest regards,\n${profile.full_name}\nInsurance Agent`
    }
    return `\n\nBest regards,\nYour Insurance Agent`
  }

  const handleSendEmail = () => {
    if (!client || !subject.trim() || !message.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    if (!client.email) {
      toast({
        title: "Error",
        description: "No email address available for this client",
        variant: "destructive",
      })
      return
    }

    try {
      const fullMessage = message + getSignature()
      const mailtoUrl = `mailto:${encodeURIComponent(client.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullMessage)}`

      // Open email client
      window.open(mailtoUrl, "_self")

      toast({
        title: "Email Client Opened",
        description: `Email prepared for ${client.name}`,
      })

      onClose()
    } catch (error: any) {
      console.error("Email Error:", error)
      toast({
        title: "Email Failed",
        description: "Failed to open email client",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Send Email to {client?.name}</span>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
              {client?.email || ""}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Subject</label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Enter email subject..." />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Message</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="min-h-[120px]"
            />
          </div>

          <div className="text-xs text-muted-foreground">
            <p>Your signature will be automatically added. This will open your device's email client.</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSendEmail} disabled={!subject.trim() || !message.trim()}>
            <Mail className="mr-2 h-4 w-4" />
            Open Email Client
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
