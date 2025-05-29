"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Send, TestTube, Loader2, AlertCircle, CheckCircle, History, RefreshCw, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { sendSMS, smsService, type SMSLog } from "@/utils/sms-service"
import { formatDistanceToNow } from "date-fns"

export function SMSTestComponent() {
  const { toast } = useToast()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [message, setMessage] = useState("Hello! This is a test message from AgencyApp.")
  const [sending, setSending] = useState(false)
  const [lastResult, setLastResult] = useState<any>(null)
  const [smsLogs, setSmsLogs] = useState<SMSLog[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [retries, setRetries] = useState(2)

  // Load SMS logs on mount
  useEffect(() => {
    loadSmsLogs()
  }, [])

  const loadSmsLogs = async () => {
    setLoadingLogs(true)
    try {
      const logs = await smsService.getSMSLogs(undefined, 10)
      setSmsLogs(logs)
    } catch (error) {
      console.error("Failed to load SMS logs:", error)
    } finally {
      setLoadingLogs(false)
    }
  }

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
      // Use the enhanced SMS service
      const result = await sendSMS(phoneNumber, message, {
        retries,
        metadata: {
          source: "test-component",
          timestamp: Date.now(),
        },
      })

      setLastResult(result)

      if (result.success) {
        toast({
          title: "SMS Sent Successfully",
          description: `SMS sent to ${result.to}`,
        })
      } else {
        throw new Error(result.error || "Failed to send SMS")
      }

      // Refresh logs after sending
      await loadSmsLogs()
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

  // Format the phone number as the user types
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value)
  }

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-500"
      case "sent":
        return "bg-blue-500"
      case "pending":
        return "bg-yellow-500"
      case "failed":
        return "bg-red-500"
      case "undelivered":
        return "bg-red-300"
      default:
        return "bg-gray-500"
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch (e) {
      return dateString
    }
  }

  return (
    <Tabs defaultValue="send" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="send">Send SMS</TabsTrigger>
        <TabsTrigger value="logs">SMS Logs</TabsTrigger>
      </TabsList>

      <TabsContent value="send" className="space-y-4">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              SMS Test
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
                onChange={handlePhoneChange}
              />
              <p className="text-xs text-muted-foreground">
                Will be formatted as: {phoneNumber ? smsService.formatPhoneNumber(phoneNumber) : "+233XXXXXXXXX"}
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
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{message.length} characters</span>
                <span>
                  {message.length > 160 ? Math.ceil(message.length / 153) : 1} SMS segment
                  {message.length > 160 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Advanced Options */}
            <Accordion type="single" collapsible>
              <AccordionItem value="advanced-options">
                <AccordionTrigger className="text-sm">Advanced Options</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="retries">Retry Attempts</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="retries"
                          type="number"
                          min={0}
                          max={5}
                          value={retries}
                          onChange={(e) => setRetries(Number.parseInt(e.target.value) || 0)}
                        />
                        <div className="text-xs text-muted-foreground">
                          <Info className="h-4 w-4 inline mr-1" />
                          Will retry on network errors
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

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
                  <div className="mt-2 text-sm text-green-600">
                    <p>Message ID: {lastResult.messageId}</p>
                    <p>Status: {lastResult.status}</p>
                    <p>To: {lastResult.to}</p>
                    {lastResult.retryCount > 0 && (
                      <p>
                        Sent after {lastResult.retryCount} {lastResult.retryCount === 1 ? "retry" : "retries"}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <p className="font-medium text-red-700">Failed to send SMS</p>
                  <p className="text-sm text-red-600">{lastResult.error}</p>
                  {lastResult.errorCode && <p className="text-sm text-red-600">Error code: {lastResult.errorCode}</p>}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
      </TabsContent>

      <TabsContent value="logs">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent SMS Logs</CardTitle>
            <Button variant="outline" size="sm" onClick={loadSmsLogs} disabled={loadingLogs}>
              {loadingLogs ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span className="ml-2">Refresh</span>
            </Button>
          </CardHeader>
          <CardContent>
            {loadingLogs ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : smsLogs.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead>Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {smsLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs">{log.recipient}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(log.status)}>{log.status}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{formatDate(log.createdAt)}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-xs">{log.message}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <History className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No SMS logs found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
