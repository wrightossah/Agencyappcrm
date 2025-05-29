"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Smartphone, Monitor } from "lucide-react"
import { handleSMSClick, isMobileDevice, formatSMSMessage } from "@/utils/native-sms"

export function SMSNativeTest() {
  const [testClient, setTestClient] = useState({
    name: "John Doe",
    phone: "+233241234567",
    policy_type: "Motor Insurance",
    expiry_date: "2024-12-31",
  })

  const isMobile = isMobileDevice()
  const previewMessage = formatSMSMessage(testClient)

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Native SMS Test
          {isMobile ? (
            <Smartphone className="h-4 w-4 text-green-600" title="Mobile device detected" />
          ) : (
            <Monitor className="h-4 w-4 text-orange-600" title="Desktop device detected" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Client Name</Label>
            <Input
              id="name"
              value={testClient.name}
              onChange={(e) => setTestClient((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={testClient.phone}
              onChange={(e) => setTestClient((prev) => ({ ...prev, phone: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="policy_type">Policy Type</Label>
            <Input
              id="policy_type"
              value={testClient.policy_type}
              onChange={(e) => setTestClient((prev) => ({ ...prev, policy_type: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="expiry_date">Expiry Date</Label>
            <Input
              id="expiry_date"
              type="date"
              value={testClient.expiry_date}
              onChange={(e) => setTestClient((prev) => ({ ...prev, expiry_date: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Message Preview:</Label>
          <div className="p-3 bg-muted rounded-md text-sm">{previewMessage}</div>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => handleSMSClick(testClient)} className="flex-1">
            <MessageSquare className="h-4 w-4 mr-2" />
            {isMobile ? "Open SMS App" : "Copy Message"}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          {isMobile ? (
            <p>✅ Mobile device detected - SMS app will open automatically</p>
          ) : (
            <p>⚠️ Desktop detected - message will be copied to clipboard</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
