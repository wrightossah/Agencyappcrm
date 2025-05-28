"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Save, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function SMSSettings() {
  const { toast } = useToast()
  const [settings, setSettings] = useState({
    defaultSender: "AgencyApp",
    defaultTemplates: {
      greeting: "Hello {clientName}, this is a message from your insurance agent at AgencyApp.",
      reminder: "Hi {clientName}, your policy is due for renewal. Please contact us for details. - AgencyApp",
      thankYou: "Thank you {clientName} for choosing our insurance services. We appreciate your business! - AgencyApp",
    },
  })
  const [balance, setBalance] = useState<{ balance: number; currency: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchBalance = async () => {
    try {
      const response = await fetch("/api/sms-balance")
      const result = await response.json()

      if (result.success) {
        setBalance({
          balance: result.balance,
          currency: result.currency,
        })
      }
    } catch (error) {
      console.error("Balance Error:", error)
    }
  }

  useEffect(() => {
    fetchBalance()
  }, [])

  const handleSaveSettings = async () => {
    setLoading(true)
    try {
      // Here you would save settings to your backend
      // For now, we'll just show a success message
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

      toast({
        title: "Settings Saved",
        description: "SMS settings have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getBalanceStatus = (balance: number) => {
    if (balance > 100) return { status: "Good", color: "bg-green-500" }
    if (balance > 50) return { status: "Low", color: "bg-yellow-500" }
    return { status: "Critical", color: "bg-red-500" }
  }

  return (
    <div className="space-y-6">
      {/* SMS Balance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            SMS Balance & Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              {balance ? (
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {balance.balance.toLocaleString()} {balance.currency}
                  </div>
                  <Badge className={`${getBalanceStatus(balance.balance).color} text-white`}>
                    {getBalanceStatus(balance.balance).status}
                  </Badge>
                </div>
              ) : (
                <div className="text-muted-foreground">Loading balance...</div>
              )}
            </div>
            <Button variant="outline" onClick={fetchBalance}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* SMS Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>SMS Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="defaultSender">Default Sender ID</Label>
            <Input
              id="defaultSender"
              value={settings.defaultSender}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  defaultSender: e.target.value,
                }))
              }
              placeholder="AgencyApp"
            />
            <p className="text-xs text-muted-foreground">This will appear as the sender of your SMS messages</p>
          </div>
        </CardContent>
      </Card>

      {/* Message Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Default Message Templates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="greetingTemplate">Greeting Template</Label>
            <Textarea
              id="greetingTemplate"
              value={settings.defaultTemplates.greeting}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  defaultTemplates: {
                    ...prev.defaultTemplates,
                    greeting: e.target.value,
                  },
                }))
              }
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminderTemplate">Reminder Template</Label>
            <Textarea
              id="reminderTemplate"
              value={settings.defaultTemplates.reminder}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  defaultTemplates: {
                    ...prev.defaultTemplates,
                    reminder: e.target.value,
                  },
                }))
              }
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="thankYouTemplate">Thank You Template</Label>
            <Textarea
              id="thankYouTemplate"
              value={settings.defaultTemplates.thankYou}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  defaultTemplates: {
                    ...prev.defaultTemplates,
                    thankYou: e.target.value,
                  },
                }))
              }
              rows={2}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Use {"{clientName}"} as a placeholder for the client's name in your templates.
          </p>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={loading}>
          {loading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
