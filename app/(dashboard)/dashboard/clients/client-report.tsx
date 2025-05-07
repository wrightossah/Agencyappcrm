"\"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, FileDown, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/export-utils"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"

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

export function ClientReport({ isOpen, onClose, client }: ClientReportProps) {
  const { toast } = useToast()
  const { user } = useAuth()

  // State for section visibility
  const [sections, setSections] = useState({
    basicInfo: true,
    policies: true,
    claims: true,
    notes: true,
  })

  // State for client data
  const [policies, setPolicies] = useState<Policy[]>([])
  const [claims, setClaims] = useState<Claim[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch client data when client changes
  useEffect(() => {
    if (client && client.id && isOpen) {
      fetchClientData(client.id)
    }
  }, [client, isOpen])

  // Implement the code snippets provided by the user
  useEffect(() => {
    const fetchAgentData = async () => {
      if (!user) return

      try {
        // Fetch agent data
        const { data } = await supabase.from("agents").select().eq("id", user.id)
        console.log(data) // Might log [{}] or []

        // Log the data received
        console.log("Data received:", data)

        // Get user name from metadata
        const name = user?.user_metadata?.full_name || "No name"
        console.log("User name:", name)

        return {} // Return an empty object
      } catch (err) {
        console.error("Error fetching agent data:", err)
      }
    }

    fetchAgentData()
  }, [user])

  const fetchClientData = async (clientId: string) => {
    setLoading(true)
    setError(null)

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

      // Fetch notes (if you have a notes table)
      try {
        const { data: notesData, error: notesError } = await supabase
          .from("client_notes")
          .select("*")
          .eq("client_id", clientId)
          .order("created_at", { ascending: false })

        if (!notesError) {
          setNotes(notesData || [])
        }
      } catch (noteError) {
        console.log("Notes table may not exist yet:", noteError)
        setNotes([])
      }
    } catch (error: any) {
      console.error("Error fetching client data:", error)
      setError(error.message || "Failed to load client data. Please try again.")
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
    if (typeof amount !== "number" || isNaN(amount)) {
      return "Ghc 0.00"
    }
    return `Ghc ${amount.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  // Function to format date
  const formatDateString = (dateString: string) => {
    if (!dateString) return "N/A"

    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "Invalid Date"
      return date.toLocaleDateString("en-GH", { day: "2-digit", month: "short", year: "numeric" })
    } catch (e) {
      return "Invalid Date"
    }
  }

  // Function to export as PDF
  const exportAsPDF = async () => {
    if (!client) return

    try {
      // Dynamically import jsPDF to avoid SSR issues
      const { jsPDF } = await import("jspdf")
      const autoTable = await import("jspdf-autotable")

      const doc = new jsPDF()

      // Add title
      doc.setFontSize(20)
      doc.text(`Client Report: ${client.name || "Unnamed Client"}`, 14, 22)
      doc.setFontSize(12)
      doc.text(`Generated on: ${formatDate(new Date())}`, 14, 32)

      let yPos = 40

      // Add basic info section
      if (sections.basicInfo) {
        doc.setFontSize(16)
        doc.text("Client Information", 14, yPos)
        yPos += 10

        doc.setFontSize(12)
        doc.text(`Name: ${client.name || "N/A"}`, 20, yPos)
        yPos += 8
        doc.text(`Email: ${client.email || "N/A"}`, 20, yPos)
        yPos += 8
        doc.text(`Phone: ${client.phone || client.phone_number || "N/A"}`, 20, yPos)
        yPos += 8
        doc.text(`Address: ${client.address || "N/A"}`, 20, yPos)
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
            policy.policy_type || "N/A",
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
            claim.claim_type || "N/A",
            formatDateString(claim.claim_date),
            claim.location || "N/A",
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

      // Add notes section
      if (sections.notes && notes.length > 0) {
        doc.setFontSize(16)
        doc.text("Notes", 14, yPos)
        yPos += 10

        notes.forEach((note) => {
          doc.setFontSize(12)
          doc.text(`${formatDateString(note.created_at)} - ${note.created_by || "Unknown"}:`, 20, yPos)
          yPos += 8

          // Split long notes into multiple lines
          const contentLines = doc.splitTextToSize(note.content || "", 170)
          doc.text(contentLines, 20, yPos)
          yPos += contentLines.length * 7 + 10

          // Check if we need a new page
          if (yPos > 280) {
            doc.addPage()
            yPos = 20
          }
        })
      }

      // Save the PDF with client name in the filename
      const clientName = client.name ? client.name.replace(/\s+/g, "-").toLowerCase() : "unnamed-client"
      doc.save(`client-report-${clientName}-${formatDate(new Date())}.pdf`)

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
      const clientName = client.name || "Unnamed Client"
      let csvContent = `"Client Report: ${clientName}"\n"Generated on: ${formatDate(new Date())}"\n\n`

      // Add basic info section
      if (sections.basicInfo) {
        csvContent += `"CLIENT INFORMATION"\n`
        csvContent += `"Name","${client.name || "N/A"}"\n`
        csvContent += `"Email","${client.email || "N/A"}"\n`
        csvContent += `"Phone","${client.phone || client.phone_number || "N/A"}"\n`
        csvContent += `"Address","${client.address || "N/A"}"\n\n`
      }

      // Add policies section
      if (sections.policies && policies.length > 0) {
        csvContent += `"POLICIES"\n`
        csvContent += `"Policy Type","Policy Number","Effective Date","Expiry Date","Premium"\n`

        policies.forEach((policy) => {
          csvContent += `"${policy.policy_type || "N/A"}","${policy.policy_number || "N/A"}","${formatDateString(policy.effective_date)}","${formatDateString(policy.expiry_date)}","${formatCurrency(policy.premium_paid)}"\n`
        })

        csvContent += `\n`
      }

      // Add claims section
      if (sections.claims && claims.length > 0) {
        csvContent += `"CLAIMS"\n`
        csvContent += `"Claim Type","Date","Location","Amount","Status"\n`

        claims.forEach((claim) => {
          csvContent += `"${claim.claim_type || "N/A"}","${formatDateString(claim.claim_date)}","${claim.location || "N/A"}","${formatCurrency(claim.amount)}","${claim.status || "Pending"}"\n`
        })

        csvContent += `\n`
      }

      // Add notes section
      if (sections.notes && notes.length > 0) {
        csvContent += `"NOTES"\n`
        csvContent += `"Date","Created By","Content"\n`

        notes.forEach((note) => {
          csvContent += `"${formatDateString(note.created_at)}","${note.created_by || "Unknown"}","${note.content || ""}"\n`
        })
      }

      // Create a blob and download with client name in the filename
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      const fileName = client.name ? client.name.replace(/\s+/g, "-").toLowerCase() : "unnamed-client"
      link.setAttribute("download", `client-report-${fileName}-${formatDate(new Date())}.csv`)
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
          <DialogTitle className="text-2xl">Client Report: {client.name || "Unnamed Client"}</DialogTitle>
        </DialogHeader>

        {/* Error Message */}
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">{error}</div>}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading client data...</span>
          </div>
        ) : (
          <>
            {/* Section Selection */}
            <div className="bg-muted/50 p-4 rounded-md mb-4">
              <h3 className="font-medium mb-2">Include in Report:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="basicInfo"
                    checked={sections.basicInfo}
                    onCheckedChange={() => toggleSection("basicInfo")}
                  />
                  <Label htmlFor="basicInfo">Basic Info</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="policies"
                    checked={sections.policies}
                    onCheckedChange={() => toggleSection("policies")}
                  />
                  <Label htmlFor="policies">Policies</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="claims" checked={sections.claims} onCheckedChange={() => toggleSection("claims")} />
                  <Label htmlFor="claims">Claims</Label>
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
                        <p>{client.name || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                        <p>{client.email || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Phone</p>
                        <p>{client.phone || client.phone_number || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Address</p>
                        <p>{client.address || "N/A"}</p>
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
                                <td className="py-3 px-4">{policy.policy_type || "N/A"}</td>
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
                                <td className="py-3 px-4">{claim.claim_type || "N/A"}</td>
                                <td className="py-3 px-4">{formatDateString(claim.claim_date)}</td>
                                <td className="py-3 px-4">{claim.location || "N/A"}</td>
                                <td className="py-3 px-4">{claim.description || "N/A"}</td>
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
                              <span className="font-medium">{note.created_by || "Unknown"}</span>
                              <span className="text-sm text-muted-foreground">{formatDateString(note.created_at)}</span>
                            </div>
                            <p>{note.content || "No content"}</p>
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
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default ClientReport
