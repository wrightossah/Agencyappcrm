"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, MessageSquare, Send, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { sendSMS, sendEmail, messageTemplates } from "@/lib/communication-services"

interface Client {
  id: string
  name: string
  email: string
  phone: string
  phone_number: string
}

interface CommunicationModalProps {
  isOpen: boolean
  onClose: () => void
  client: Client | null
  type: "sms" | "email"
}

export function CommunicationModal({ isOpen, onClose, client, type }: CommunicationModalProps) {
  const { toast } = useToast()
  const [message, setMessage] = useState("")
  const [subject, setSubject] = useState("")
  const [template, setTemplate] = useState("")
  const [sending, setSending] = useState(false)

  const handleTemplateChange = (templateKey: string) => {
    setTemplate(templateKey)

    if (client) {
      if (type === "sms") {
        const templateMessage = messageTemplates.sms[templateKey as keyof typeof messageTemplates.sms]
        setMessage(templateMessage.replace("{clientName}", client.name))
      } else {
        const templateSubject =
          messageTemplates.email.subject[templateKey as keyof typeof messageTemplates.email.subject]
        const templateBody = messageTemplates.email.body[templateKey as keyof typeof messageTemplates.email.body]
        setSubject(templateSubject)
        setMessage(templateBody.replace("{clientName}", client.name))
      }
    }
  }

  const handleSend = async () => {
    if (!client || !message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message.",
        variant: "destructive",
      })
      return
    }

    setSending(true)

    try {
      let result

      if (type === "sms") {
        const phoneNumber = client.phone || client.phone_number
        if (!phoneNumber) {
          throw new Error("No phone number available for this client")
        }
        result = await sendSMS(phoneNumber, message)
      } else {
        if (!client.email) {
          throw new Error("No email address available for this client")
        }
        if (!subject.trim()) {
          throw new Error("Please enter a subject")
        }
        result = await sendEmail(client.email, subject, message, client.name)
      }

      if (result.success) {
        toast({
          title: "Message Sent",
          description: `${type === "sms" ? "SMS" : "Email"} sent successfully to ${client.name}.`,
        })
        onClose()
        setMessage("")
        setSubject("")
        setTemplate("")
      } else {
        throw new Error(result.error || "Failed to send message")
      }
    } catch (error) {
      console.error(`${type} Error:`, error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to send ${type}`,
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  const handleClose = () => {
    onClose()
    setMessage("")
    setSubject("")
    setTemplate("")
  }

  if (!client) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === "sms" ? <MessageSquare className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
            Send {type === "sms" ? "SMS" : "Email"} to {client.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template Selection */}
          <div className="space-y-2">
            <Label htmlFor="template">Message Template</Label>
            <Select value={template} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a template (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="greeting">General Greeting</SelectItem>
                <SelectItem value="policyReminder">Policy Reminder</SelectItem>
                <SelectItem value="thankYou">Thank You Message</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Recipient Info */}
          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-sm font-medium">Sending to:</p>
            <p className="text-sm text-muted-foreground">
              {type === "sms"
                ? client.phone || client.phone_number || "No phone number"
                : client.email || "No email address"}
            </p>
          </div>

          {/* Subject (Email only) */}
          {type === "email" && (
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject"
                required
              />
            </div>
          )}

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Enter your ${type === "sms" ? "SMS" : "email"} message...`}
              rows={type === "sms" ? 4 : 6}
              className="resize-none"
              required
            />
            {type === "sms" && <p className="text-xs text-muted-foreground">{message.length}/160 characters</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={sending || !message.trim() || (type === "email" && !subject.trim())}
              className="flex-1"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send {type === "sms" ? "SMS" : "Email"}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
