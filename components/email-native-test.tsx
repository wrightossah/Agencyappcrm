"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Mail } from "lucide-react"
import { handleEmailClick, formatEmailBody, type ClientEmailData } from "@/utils/native-email"

export default function EmailNativeTest() {
  const [testClient, setTestClient] = useState<ClientEmailData>({
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    policy_type: "Motor Insurance",
    expiry_date: "2024-02-15",
  })

  const [previewBody, setPreviewBody] = useState("")

  const handlePreview = () => {
    const body = formatEmailBody(testClient)
    setPreviewBody(body)
  }

  const handleTestEmail = () => {
    handleEmailClick(testClient)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Native Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="name">Client Name</Label>
                <Input
                  id="name"
                  value={testClient.name}
                  onChange={(e) => setTestClient((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter client name"
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={testClient.email}
                  onChange={(e) => setTestClient((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <Label htmlFor="policy_type">Policy Type</Label>
                <Input
                  id="policy_type"
                  value={testClient.policy_type || ""}
                  onChange={(e) => setTestClient((prev) => ({ ...prev, policy_type: e.target.value }))}
                  placeholder="Enter policy type"
                />
              </div>

              <div>
                <Label htmlFor="expiry_date">Expiry Date</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={testClient.expiry_date || ""}
                  onChange={(e) => setTestClient((prev) => ({ ...prev, expiry_date: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label>Email Preview</Label>
                <div className="border rounded-md p-3 bg-muted/50 min-h-[200px]">
                  {previewBody ? (
                    <pre className="whitespace-pre-wrap text-sm">{previewBody}</pre>
                  ) : (
                    <p className="text-muted-foreground text-sm">Click "Preview Email" to see the formatted message</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handlePreview} variant="outline">
              Preview Email
            </Button>
            <Button onClick={handleTestEmail} className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Test Email
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>
              <strong>How it works:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>On mobile: Opens your default email app with pre-filled content</li>
              <li>On desktop: Attempts to open email client, falls back to clipboard copy</li>
              <li>Subject: "Policy Renewal Reminder"</li>
              <li>Body: Personalized message with client and policy details</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
