"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, FileDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { jsPDF } from "jspdf"
import "jspdf-autotable"
import { formatDate } from "@/lib/export-utils"
import { supabase } from "@/lib/supabase"

// Define interfaces for data types
interface Client {
  id: string
  name: string
  email: string
  address: string
  phone: string
  phone_number: string
  created_at?: string
}

interface Policy {
  id: string
  client_id: string
  policy_type: string
  policy_number?: string
  effective_date: string
  expiry_date: string
  premium_paid: number
  status?: string
  created_at?: string
}

interface Claim {
  id: string
  client_id: string
  claim_type: string
  claim_date: string
  location: string
  description: string
  amount: number
  status?: string
  created_at?: string
}

interface Subscription {
  id: string
  client_id: string
  plan: string
  start_date: string
  end_date: string
  amount: number
  status: string
  created_at?: string
}

interface Note {
  id: string
  client_id: string
  content: string
  created_by: string
  created_at: string
}

interface ClientReportProps {
  isOpen: boolean
  onClose: () => void
  client: Client | null
}

export default function ClientReport({ isOpen, onClose, client }: ClientReportProps) {
  const { toast } = useToast()

  // State for section visibility
  const [sections, setSections] = useState({
    basicInfo: true,
    policies: true,
    claims: true,
    subscriptions: true,
    notes: true,
  })

  // State for client data
  const [policies, setPolicies] = useState<Policy[]>([])
  const [claims, setClaims] = useState<Claim[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  // Update the useEffect to check for a valid client ID

  // Fetch client data when client changes
  useEffect(() => {
    if (client && client.id && isOpen) {
      fetchClientData(client.id)
    }
  }, [client, isOpen])

  // Update the fetchClientData function to handle the client ID properly

  const fetchClientData = async (clientId: string) => {
    setLoading(true)

    try {
      // Validate that clientId is a proper UUID before querying
      if (!clientId || typeof clientId !== "string") {
        throw new Error("Invalid client ID")
      }

      // Fetch policies
      const { data: policiesData, error: policiesError } = await supabase
        .from("policies")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false })

      if (policiesError) throw policiesError
      setPolicies(policiesData || [])

      // Fetch claims
      const { data: claimsData, error: claimsError } = await supabase
        .from("claims")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false })

      if (claimsError) throw claimsError
      setClaims(claimsData || [])

      // For demo purposes, we'll create mock subscriptions and notes
      // In a real app, you would fetch these from your database
      setSubscriptions([
        {
          id: "sub1",
          client_id: clientId,
          plan: "Premium",
          start_date: "2023-01-01",
          end_date: "2023-12-31",
          amount: 1200,
          status: "Active",
          created_at: "2023-01-01",
        },
        {
          id: "sub2",
          client_id: clientId,
          plan: "Basic",
          start_date: "2022-01-01",
          end_date: "2022-12-31",
          amount: 600,
          status: "Expired",
          created_at: "2022-01-01",
        },
      ])

      setNotes([
        {
          id: "note1",
          client_id: clientId,
          content: "Client requested information about travel insurance options.",
          created_by: "Agent",
          created_at: "2023-05-15T10:30:00Z",
        },
        {
          id: "note2",
          client_id: clientId,
          content: "Follow-up call scheduled for policy renewal discussion.",
          created_by: "Agent",
          created_at: "2023-06-20T14:45:00Z",
        },
      ])
    } catch (error: any) {
      console.error("Error fetching client data:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load client data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Function to toggle section visibility
  const toggleSection = (section: keyof typeof sections) => {
    setSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Function to format currency
  const formatCurrency = (amount: number) => {
    return `Ghc ${amount.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  // Function to format date
  const formatDateString = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-GH", { day: "2-digit", month: "short", year: "numeric" })
    } catch (e) {
      return dateString
    }
  }

  // Function to export as PDF
  const exportAsPDF = () => {
    if (!client) return

    try {
      const doc = new jsPDF()

      // Add title
      doc.setFontSize(20)
      doc.text(`Client Report: ${client.name}`, 14, 22)
      doc.setFontSize(12)
      doc.text(`Generated on: ${formatDate(new Date())}`, 14, 32)

      let yPos = 40

      // Add basic info section
      if (sections.basicInfo) {
        doc.setFontSize(16)
        doc.text("Client Information", 14, yPos)
        yPos += 10

        doc.setFontSize(12)
        doc.text(`Name: ${client.name}`, 20, yPos)
        yPos += 8
        doc.text(`Email: ${client.email}`, 20, yPos)
        yPos += 8
        doc.text(`Phone: ${client.phone || client.phone_number}`, 20, yPos)
        yPos += 8
        doc.text(`Address: ${client.address}`, 20, yPos)
        yPos += 16
      }

      // Add policies section
      if (sections.policies && policies.length > 0) {
        doc.setFontSize(16)
        doc.text("Policies", 14, yPos)
        yPos += 10

        // @ts-ignore - jsPDF types are not properly defined for autoTable
        doc.autoTable({
          startY: yPos,
          head: [["Policy Type", "Policy Number", "Effective Date", "Expiry Date", "Premium"]],
          body: policies.map((policy) => [
            policy.policy_type,
            policy.policy_number || "N/A",
            formatDateString(policy.effective_date),
            formatDateString(policy.expiry_date),
            formatCurrency(policy.premium_paid),
          ]),
          margin: { top: 10 },
          styles: { overflow: "linebreak" },
          headStyles: { fillColor: [66, 66, 66] },
        })

        // @ts-ignore - accessing lastAutoTable which is added by the plugin
        yPos = doc.lastAutoTable.finalY + 16
      }

      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }

      // Add claims section
      if (sections.claims && claims.length > 0) {
        doc.setFontSize(16)
        doc.text("Claims", 14, yPos)
        yPos += 10

        // @ts-ignore - jsPDF types are not properly defined for autoTable
        doc.autoTable({
          startY: yPos,
          head: [["Claim Type", "Date", "Location", "Amount", "Status"]],
          body: claims.map((claim) => [
            claim.claim_type,
            formatDateString(claim.claim_date),
            claim.location,
            formatCurrency(claim.amount),
            claim.status || "Pending",
          ]),
          margin: { top: 10 },
          styles: { overflow: "linebreak" },
          headStyles: { fillColor: [66, 66, 66] },
        })

        // @ts-ignore - accessing lastAutoTable which is added by the plugin
        yPos = doc.lastAutoTable.finalY + 16
      }

      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }

      // Add subscriptions section
      if (sections.subscriptions && subscriptions.length > 0) {
        doc.setFontSize(16)
        doc.text("Subscriptions", 14, yPos)
        yPos += 10

        // @ts-ignore - jsPDF types are not properly defined for autoTable
        doc.autoTable({
          startY: yPos,
          head: [["Plan", "Start Date", "End Date", "Amount", "Status"]],
          body: subscriptions.map((sub) => [
            sub.plan,
            formatDateString(sub.start_date),
            formatDateString(sub.end_date),
            formatCurrency(sub.amount),
            sub.status,
          ]),
          margin: { top: 10 },
          styles: { overflow: "linebreak" },
          headStyles: { fillColor: [66, 66, 66] },
        })

        // @ts-ignore - accessing lastAutoTable which is added by the plugin
        yPos = doc.lastAutoTable.finalY + 16
      }

      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }

      // Add notes section
      if (sections.notes && notes.length > 0) {
        doc.setFontSize(16)
        doc.text("Notes", 14, yPos)
        yPos += 10

        notes.forEach((note) => {
          doc.setFontSize(12)
          doc.text(`${formatDateString(note.created_at)} - ${note.created_by}:`, 20, yPos)
          yPos += 8

          // Split long notes into multiple lines
          const contentLines = doc.splitTextToSize(note.content, 170)
          doc.text(contentLines, 20, yPos)
          yPos += contentLines.length * 7 + 10

          // Check if we need a new page
          if (yPos > 280) {
            doc.addPage()
            yPos = 20
          }
        })
      }

      // Save the PDF
      doc.save(`client-report-${client.name.replace(/\s+/g, "-").toLowerCase()}-${formatDate(new Date())}.pdf`)

      toast({
        title: "Success",
        description: "PDF report has been generated and downloaded.",
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Function to export as CSV
  const exportAsCSV = () => {
    if (!client) return

    try {
      let csvContent = `"Client Report: ${client.name}"\n"Generated on: ${formatDate(new Date())}"\n\n`

      // Add basic info section
      if (sections.basicInfo) {
        csvContent += `"CLIENT INFORMATION"\n`
        csvContent += `"Name","${client.name}"\n`
        csvContent += `"Email","${client.email}"\n`
        csvContent += `"Phone","${client.phone || client.phone_number}"\n`
        csvContent += `"Address","${client.address}"\n\n`
      }

      // Add policies section
      if (sections.policies && policies.length > 0) {
        csvContent += `"POLICIES"\n`
        csvContent += `"Policy Type","Policy Number","Effective Date","Expiry Date","Premium"\n`

        policies.forEach((policy) => {
          csvContent += `"${policy.policy_type}","${policy.policy_number || "N/A"}","${formatDateString(policy.effective_date)}","${formatDateString(policy.expiry_date)}","${formatCurrency(policy.premium_paid)}"\n`
        })

        csvContent += `\n`
      }

      // Add claims section
      if (sections.claims && claims.length > 0) {
        csvContent += `"CLAIMS"\n`
        csvContent += `"Claim Type","Date","Location","Amount","Status"\n`

        claims.forEach((claim) => {
          csvContent += `"${claim.claim_type}","${formatDateString(claim.claim_date)}","${claim.location}","${formatCurrency(claim.amount)}","${claim.status || "Pending"}"\n`
        })

        csvContent += `\n`
      }

      // Add subscriptions section
      if (sections.subscriptions && subscriptions.length > 0) {
        csvContent += `"SUBSCRIPTIONS"\n`
        csvContent += `"Plan","Start Date","End Date","Amount","Status"\n`

        subscriptions.forEach((sub) => {
          csvContent += `"${sub.plan}","${formatDateString(sub.start_date)}","${formatDateString(sub.end_date)}","${formatCurrency(sub.amount)}","${sub.status}"\n`
        })

        csvContent += `\n`
      }

      // Add notes section
      if (sections.notes && notes.length > 0) {
        csvContent += `"NOTES"\n`
        csvContent += `"Date","Created By","Content"\n`

        notes.forEach((note) => {
          csvContent += `"${formatDateString(note.created_at)}","${note.created_by}","${note.content}"\n`
        })
      }

      // Create a blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute(
        "download",
        `client-report-${client.name.replace(/\s+/g, "-").toLowerCase()}-${formatDate(new Date())}.csv`,
      )
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Success",
        description: "CSV report has been generated and downloaded.",
      })
    } catch (error) {
      console.error("Error generating CSV:", error)
      toast({
        title: "Error",
        description: "Failed to generate CSV. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (!client) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Client Report: {client.name}</DialogTitle>
        </DialogHeader>

        {/* Section Selection */}
        <div className="bg-muted/50 p-4 rounded-md mb-4">
          <h3 className="font-medium mb-2">Include in Report:</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="basicInfo"
                checked={sections.basicInfo}
                onCheckedChange={() => toggleSection("basicInfo")}
              />
              <Label htmlFor="basicInfo">Basic Info</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="policies" checked={sections.policies} onCheckedChange={() => toggleSection("policies")} />
              <Label htmlFor="policies">Policies</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="claims" checked={sections.claims} onCheckedChange={() => toggleSection("claims")} />
              <Label htmlFor="claims">Claims</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="subscriptions"
                checked={sections.subscriptions}
                onCheckedChange={() => toggleSection("subscriptions")}
              />
              <Label htmlFor="subscriptions">Subscriptions</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="notes" checked={sections.notes} onCheckedChange={() => toggleSection("notes")} />
              <Label htmlFor="notes">Notes</Label>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="space-y-6">
          {/* Basic Info Section */}
          {sections.basicInfo && (
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                    <p>{client.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p>{client.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <p>{client.phone || client.phone_number}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Address</p>
                    <p>{client.address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Policies Section */}
          {sections.policies && (
            <Card>
              <CardHeader>
                <CardTitle>Policies</CardTitle>
              </CardHeader>
              <CardContent>
                {policies.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Policy Type</th>
                          <th className="text-left py-3 px-4">Policy Number</th>
                          <th className="text-left py-3 px-4">Effective Date</th>
                          <th className="text-left py-3 px-4">Expiry Date</th>
                          <th className="text-right py-3 px-4">Premium</th>
                        </tr>
                      </thead>
                      <tbody>
                        {policies.map((policy) => (
                          <tr key={policy.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4">{policy.policy_type}</td>
                            <td className="py-3 px-4">{policy.policy_number || "N/A"}</td>
                            <td className="py-3 px-4">{formatDateString(policy.effective_date)}</td>
                            <td className="py-3 px-4">{formatDateString(policy.expiry_date)}</td>
                            <td className="py-3 px-4 text-right">{formatCurrency(policy.premium_paid)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No policies found</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Claims Section */}
          {sections.claims && (
            <Card>
              <CardHeader>
                <CardTitle>Claims</CardTitle>
              </CardHeader>
              <CardContent>
                {claims.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Claim Type</th>
                          <th className="text-left py-3 px-4">Date</th>
                          <th className="text-left py-3 px-4">Location</th>
                          <th className="text-left py-3 px-4">Description</th>
                          <th className="text-right py-3 px-4">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {claims.map((claim) => (
                          <tr key={claim.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4">{claim.claim_type}</td>
                            <td className="py-3 px-4">{formatDateString(claim.claim_date)}</td>
                            <td className="py-3 px-4">{claim.location}</td>
                            <td className="py-3 px-4">{claim.description}</td>
                            <td className="py-3 px-4 text-right">{formatCurrency(claim.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No claims found</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Subscriptions Section */}
          {sections.subscriptions && (
            <Card>
              <CardHeader>
                <CardTitle>Subscriptions</CardTitle>
              </CardHeader>
              <CardContent>
                {subscriptions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Plan</th>
                          <th className="text-left py-3 px-4">Start Date</th>
                          <th className="text-left py-3 px-4">End Date</th>
                          <th className="text-right py-3 px-4">Amount</th>
                          <th className="text-left py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subscriptions.map((sub) => (
                          <tr key={sub.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4">{sub.plan}</td>
                            <td className="py-3 px-4">{formatDateString(sub.start_date)}</td>
                            <td className="py-3 px-4">{formatDateString(sub.end_date)}</td>
                            <td className="py-3 px-4 text-right">{formatCurrency(sub.amount)}</td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  sub.status === "Active"
                                    ? "bg-green-100 text-green-800"
                                    : sub.status === "Expired"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {sub.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No subscriptions found</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Notes Section */}
          {sections.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                {notes.length > 0 ? (
                  <div className="space-y-4">
                    {notes.map((note) => (
                      <div key={note.id} className="p-4 border rounded-md">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{note.created_by}</span>
                          <span className="text-sm text-muted-foreground">{formatDateString(note.created_at)}</span>
                        </div>
                        <p>{note.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No notes found</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Export Options */}
        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" onClick={exportAsCSV}>
            <FileDown className="mr-2 h-4 w-4" />
            Export as CSV
          </Button>
          <Button onClick={exportAsPDF}>
            <FileText className="mr-2 h-4 w-4" />
            Export as PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
