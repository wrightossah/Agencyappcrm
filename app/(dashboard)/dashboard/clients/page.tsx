"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Search, Edit, Trash2, MessageCircle, Loader2, FileText, ArrowLeft, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import ClientForm from "./client-form"
import PolicyForm from "./policy-form"
import ClaimForm from "./claim-form"
import PolicyList from "./policy-list"
import DeleteConfirmation from "./delete-confirmation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import ClientReport from "./client-report"
import { ensureAgentsTable, addCurrentUserAsAgent } from "./actions"

// Update the Client interface to include both phone and phone_number
interface Client {
  id: string
  created_by: string
  name: string
  address: string
  phone: string
  phone_number: string
  email: string
  created_at?: string
}

// Update the Policy interface to include the new fields
interface Policy {
  id: string
  client_id: string
  policy_type: string
  policy_number?: string
  effective_date: string
  expiry_date: string
  premium_paid: number
  commission_rate?: number
  commission_amount?: number
  active?: boolean
  created_at?: string
}

// Define claim type
interface Claim {
  id: string
  client_id: string
  claim_type: string
  claim_date: string
  location: string
  description: string
  amount: number
  created_at?: string
}

export default function ClientsPage() {
  // State for clients data
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State for modals
  const [isClientFormOpen, setIsClientFormOpen] = useState(false)
  const [isPolicyFormOpen, setIsPolicyFormOpen] = useState(false)
  const [isClaimFormOpen, setIsClaimFormOpen] = useState(false)
  const [isPolicyListOpen, setIsPolicyListOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [currentClient, setCurrentClient] = useState<Client | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formSubmitting, setFormSubmitting] = useState(false)

  // State for validation
  const [emailExists, setEmailExists] = useState(false)
  const [phoneExists, setPhoneExists] = useState(false)

  const { toast } = useToast()
  const { user } = useAuth()
  const router = useRouter()

  // Ensure agents table and add current user as agent on component mount
  useEffect(() => {
    if (user) {
      setupAgentAndFetchClients()
    }
  }, [user])

  // Setup agent and fetch clients
  const setupAgentAndFetchClients = async () => {
    if (!user) return

    try {
      // Ensure the agents table exists
      await ensureAgentsTable()

      // Add the current user as an agent if not already
      await addCurrentUserAsAgent()

      // Fetch clients
      await fetchClients()
    } catch (err: any) {
      console.error("Error setting up agent:", err)
      setError(err.message || "Failed to set up agent")
      setLoading(false)
    }
  }

  // Filter clients when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredClients(clients)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = clients.filter(
        (client) =>
          (client.name?.toLowerCase() || "").includes(query) || (client.email?.toLowerCase() || "").includes(query),
      )
      setFilteredClients(filtered)
    }
  }, [searchQuery, clients])

  // Fetch clients from Supabase
  const fetchClients = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      // Ensure all client objects have the required properties
      const validatedClients = (data || []).map((client) => ({
        id: client.id || "",
        created_by: client.created_by || user.id,
        name: client.name || "",
        address: client.address || "",
        phone: client.phone || client.phone_number || "",
        phone_number: client.phone_number || client.phone || "",
        email: client.email || "",
        created_at: client.created_at || new Date().toISOString(),
      }))

      setClients(validatedClients)
      setFilteredClients(validatedClients)
    } catch (err: any) {
      console.error("Error fetching clients:", err)
      setError(err.message || "Failed to fetch clients")
    } finally {
      setLoading(false)
    }
  }

  // Check if email or phone already exists
  const checkDuplicates = async (email: string, phone: string, clientId?: string) => {
    if (!user) return { emailExists: false, phoneExists: false }

    try {
      // Check for duplicate email
      let query = supabase.from("clients").select("id").eq("created_by", user.id).eq("email", email)

      // If editing, exclude current client
      if (clientId) {
        query = query.neq("id", clientId)
      }

      const { data: emailData, error: emailError } = await query

      if (emailError) throw emailError

      // Check for duplicate phone
      let phoneQuery = supabase
        .from("clients")
        .select("id")
        .eq("created_by", user.id)
        .or(`phone.eq.${phone},phone_number.eq.${phone}`)

      // If editing, exclude current client
      if (clientId) {
        phoneQuery = phoneQuery.neq("id", clientId)
      }

      const { data: phoneData, error: phoneError } = await phoneQuery

      if (phoneError) throw phoneError

      return {
        emailExists: emailData && emailData.length > 0,
        phoneExists: phoneData && phoneData.length > 0,
      }
    } catch (err) {
      console.error("Error checking duplicates:", err)
      return { emailExists: false, phoneExists: false }
    }
  }

  // Handle adding a client
  const handleAddClient = async (client: Omit<Client, "id" | "created_by">) => {
    if (!user) return

    setFormSubmitting(true)

    try {
      // First, check if the user exists in the 'agents' table
      const { data: agent, error: agentError } = await supabase.from("agents").select("id").eq("id", user.id).single()

      if (agentError || !agent) {
        // If agent doesn't exist, try to add them
        const agentResult = await addCurrentUserAsAgent()

        if (!agentResult.success) {
          toast({
            title: "Authorization Error",
            description: "You are not authorized to add clients. Please contact support.",
            variant: "destructive",
          })
          setFormSubmitting(false)
          return
        }
      }

      // Check for duplicates
      const { emailExists, phoneExists } = await checkDuplicates(client.email, client.phone_number)

      if (emailExists) {
        setEmailExists(true)
        toast({
          title: "Duplicate Email",
          description: "This email is already linked to another client. Please use a different email address.",
          variant: "destructive",
        })
        setFormSubmitting(false)
        return
      }

      if (phoneExists) {
        setPhoneExists(true)
        toast({
          title: "Duplicate Phone",
          description: "This phone number is already associated with another client.",
          variant: "destructive",
        })
        setFormSubmitting(false)
        return
      }

      const newClient = {
        created_by: user.id,
        name: client.name,
        address: client.address,
        phone: client.phone_number, // Use the same formatted number for both fields
        phone_number: client.phone_number,
        email: client.email,
      }

      const { data, error } = await supabase.from("clients").insert([newClient]).select("*")

      if (error) throw error

      if (data && data.length > 0) {
        // Add the new client to the beginning of the clients array
        setClients([data[0], ...clients])
        // Also update filtered clients if search query is empty
        if (searchQuery.trim() === "") {
          setFilteredClients([data[0], ...filteredClients])
        }

        toast({
          title: "Client Added",
          description: `${client.name} has been added successfully.`,
        })
      }

      setIsClientFormOpen(false)
    } catch (err: any) {
      console.error("Error adding client:", err)
      toast({
        title: "Error",
        description: `Failed to add client: ${err.message || "Unknown error"}`,
        variant: "destructive",
      })
    } finally {
      setFormSubmitting(false)
    }
  }

  // Update the handleEditClient function to use the formatted phone number and check for duplicates
  const handleEditClient = async (updatedClient: Client) => {
    if (!user) return

    setFormSubmitting(true)

    try {
      // First, check if the user exists in the 'agents' table
      const { data: agent, error: agentError } = await supabase.from("agents").select("id").eq("id", user.id).single()

      if (agentError || !agent) {
        toast({
          title: "Authorization Error",
          description: "You are not authorized to edit clients. Please contact support.",
          variant: "destructive",
        })
        setFormSubmitting(false)
        return
      }

      // Check for duplicates
      const { emailExists, phoneExists } = await checkDuplicates(
        updatedClient.email,
        updatedClient.phone_number,
        updatedClient.id,
      )

      if (emailExists) {
        setEmailExists(true)
        toast({
          title: "Duplicate Email",
          description: "This email is already linked to another client. Please use a different email address.",
          variant: "destructive",
        })
        setFormSubmitting(false)
        return
      }

      if (phoneExists) {
        setPhoneExists(true)
        toast({
          title: "Duplicate Phone",
          description: "This phone number is already associated with another client.",
          variant: "destructive",
        })
        setFormSubmitting(false)
        return
      }

      const { error } = await supabase
        .from("clients")
        .update({
          name: updatedClient.name,
          address: updatedClient.address,
          phone: updatedClient.phone_number, // Use the same formatted number for both fields
          phone_number: updatedClient.phone_number,
          email: updatedClient.email,
        })
        .eq("id", updatedClient.id)
        .eq("created_by", user.id)

      if (error) throw error

      setClients(clients.map((client) => (client.id === updatedClient.id ? updatedClient : client)))

      toast({
        title: "Client Updated",
        description: `${updatedClient.name} has been updated successfully.`,
      })

      setIsClientFormOpen(false)
      setCurrentClient(null)
      setIsEditing(false)
    } catch (err: any) {
      console.error("Error updating client:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to update client",
        variant: "destructive",
      })
    } finally {
      setFormSubmitting(false)
    }
  }

  // Handle deleting a client
  const handleDeleteClient = async () => {
    if (!currentClient || !user) return

    setFormSubmitting(true)

    try {
      // First, check if the user exists in the 'agents' table
      const { data: agent, error: agentError } = await supabase.from("agents").select("id").eq("id", user.id).single()

      if (agentError || !agent) {
        toast({
          title: "Authorization Error",
          description: "You are not authorized to delete clients. Please contact support.",
          variant: "destructive",
        })
        setFormSubmitting(false)
        return
      }

      const { error } = await supabase.from("clients").delete().eq("id", currentClient.id).eq("created_by", user.id)

      if (error) throw error

      setClients(clients.filter((client) => client.id !== currentClient.id))

      toast({
        title: "Client Deleted",
        description: `${currentClient.name} has been deleted successfully.`,
      })

      setIsDeleteConfirmOpen(false)
      setCurrentClient(null)
    } catch (err: any) {
      console.error("Error deleting client:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to delete client",
        variant: "destructive",
      })
    } finally {
      setFormSubmitting(false)
    }
  }

  // Handle adding a policy to a client
  const handleAddPolicy = async (clientId: string, policy: Omit<Policy, "id" | "client_id">) => {
    if (!user) return

    setFormSubmitting(true)

    try {
      // First, check if the user exists in the 'agents' table
      const { data: agent, error: agentError } = await supabase.from("agents").select("id").eq("id", user.id).single()

      if (agentError || !agent) {
        toast({
          title: "Authorization Error",
          description: "You are not authorized to add policies. Please contact support.",
          variant: "destructive",
        })
        setFormSubmitting(false)
        return
      }

      // Prepare the payload
      const payload = {
        client_id: clientId,
        policy_type: policy.policy_type,
        policy_number: policy.policy_number,
        effective_date: policy.effective_date,
        expiry_date: policy.expiry_date,
        premium_paid: policy.premium_paid,
        commission_rate: policy.commission_rate || 0,
        commission_amount: policy.commission_amount || 0,
        active: policy.active !== undefined ? policy.active : true,
      }

      console.log("Submitting policy:", payload)

      // Validate the policy before submitting
      const isValidPolicy = (policy: any) => {
        return (
          policy.client_id &&
          policy.policy_type &&
          policy.policy_number &&
          typeof policy.premium_paid === "number" &&
          typeof policy.commission_rate === "number" &&
          policy.effective_date &&
          policy.expiry_date
        )
      }

      if (!isValidPolicy(payload)) {
        console.error("Invalid policy data:", payload)
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields correctly.",
          variant: "destructive",
        })
        setFormSubmitting(false)
        return
      }

      // Insert the policy and select the result
      const { data, error } = await supabase.from("policies").insert(payload).select()

      if (error) {
        console.error("Insert failed:", error)
        throw error
      } else {
        console.log("Insert success:", data)

        toast({
          title: "Policy Added",
          description: `New ${policy.policy_type} policy has been added successfully.`,
        })

        setIsPolicyFormOpen(false)
        // If policy list is open, refresh it
        if (isPolicyListOpen) {
          setIsPolicyListOpen(false)
          setTimeout(() => {
            setIsPolicyListOpen(true)
          }, 100)
        }
      }
    } catch (err: any) {
      console.error("Error adding policy:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to add policy",
        variant: "destructive",
      })
    } finally {
      setFormSubmitting(false)
    }
  }

  // Handle adding a claim for a client
  const handleAddClaim = async (clientId: string, claim: Omit<Claim, "id" | "client_id">) => {
    if (!user) return

    setFormSubmitting(true)

    try {
      // First, check if the user exists in the 'agents' table
      const { data: agent, error: agentError } = await supabase.from("agents").select("id").eq("id", user.id).single()

      if (agentError || !agent) {
        toast({
          title: "Authorization Error",
          description: "You are not authorized to submit claims. Please contact support.",
          variant: "destructive",
        })
        setFormSubmitting(false)
        return
      }

      // Check if claims table exists, if not create it
      const { error: tableError } = await supabase.rpc("create_claims_table_if_not_exists")

      // If there's an error but it's not because the function doesn't exist
      if (tableError && !tableError.message.includes("does not exist")) {
        throw tableError
      }

      const newClaim = {
        client_id: clientId,
        claim_type: claim.claim_type,
        claim_date: claim.claim_date,
        location: claim.location,
        description: claim.description,
        amount: claim.amount,
      }

      const { error } = await supabase.from("claims").insert([newClaim])

      if (error) throw error

      toast({
        title: "Claim Submitted",
        description: `New ${claim.claim_type} claim has been submitted successfully.`,
      })

      setIsClaimFormOpen(false)
    } catch (err: any) {
      console.error("Error adding claim:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to submit claim",
        variant: "destructive",
      })
    } finally {
      setFormSubmitting(false)
    }
  }

  // Open edit client modal
  const openEditModal = (client: Client) => {
    setCurrentClient(client)
    setIsEditing(true)
    setIsClientFormOpen(true)
  }

  // Open delete confirmation modal
  const openDeleteModal = (client: Client) => {
    setCurrentClient(client)
    setIsDeleteConfirmOpen(true)
  }

  // Open add policy modal
  const openPolicyModal = (client: Client) => {
    setCurrentClient(client)
    setIsPolicyFormOpen(true)
  }

  // Open add claim modal
  const openClaimModal = (client: Client) => {
    setCurrentClient(client)
    setIsClaimFormOpen(true)
  }

  // Open policy list modal
  const openPolicyList = (client: Client) => {
    setCurrentClient(client)
    setIsPolicyListOpen(true)
  }

  // Update the openReportModal function to ensure we're passing a valid client

  // Open report modal
  const openReportModal = (client: Client) => {
    if (!client || !client.id) {
      toast({
        title: "Error",
        description: "Invalid client data. Please try again.",
        variant: "destructive",
      })
      return
    }
    setCurrentClient(client)
    setIsReportOpen(true)
  }

  // Update the openWhatsAppChat function to use the phone number with country code
  const openWhatsAppChat = (phoneNumber: string) => {
    if (!phoneNumber) {
      toast({
        title: "Error",
        description: "No phone number available for this client.",
        variant: "destructive",
      })
      return
    }

    // Format phone number for WhatsApp
    let formattedPhone = phoneNumber

    // If it doesn't start with +, add it
    if (!formattedPhone.startsWith("+")) {
      formattedPhone = `+${formattedPhone}`
    }

    // Remove any spaces or special characters
    formattedPhone = formattedPhone.replace(/\s+/g, "")

    window.open(`https://wa.me/${formattedPhone.replace("+", "")}`, "_blank")
  }

  // Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    if (!phone) return ""

    // If it already has the country code
    if (phone.startsWith("+233")) {
      // Format as +233 XX XXX XXXX
      return phone.replace(/(\+233)(\d{2})(\d{3})(\d{4})/, "$1 $2 $3 $4")
    }

    // If it starts with 0, replace with +233
    if (phone.startsWith("0")) {
      const withCountryCode = "+233" + phone.substring(1)
      return withCountryCode.replace(/(\+233)(\d{2})(\d{3})(\d{4})/, "$1 $2 $3 $4")
    }

    // Otherwise, assume it's already formatted or doesn't match pattern
    return phone
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" size="sm" className="mb-4" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">Manage your client information and policies</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setCurrentClient(null)
              setIsEditing(false)
              setIsClientFormOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search clients by name or email..."
          className="pl-8 w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Client List - Card View */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredClients.length === 0 ? (
              <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground">No clients found</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setCurrentClient(null)
                    setIsEditing(false)
                    setIsClientFormOpen(true)
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Client
                </Button>
              </div>
            ) : (
              filteredClients.map((client) => (
                <Card key={client.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg">{client.name || "Unnamed Client"}</h3>
                        <p className="text-sm text-muted-foreground">{client.email || "No email"}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-start">
                          <span className="font-medium text-sm w-20">Address:</span>
                          <span className="text-sm">{client.address || "No address"}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium text-sm w-20">Phone:</span>
                          <span className="text-sm">
                            {formatPhoneNumber(client.phone || client.phone_number || "")}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button size="sm" variant="outline" onClick={() => openEditModal(client)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openDeleteModal(client)}>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => openWhatsAppChat(client.phone || client.phone_number || "")}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          WhatsApp
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => openPolicyList(client)}>
                          <FileText className="h-4 w-4 mr-1" />
                          View Policies
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openReportModal(client)}>
                          <FileText className="h-4 w-4 mr-1" />
                          Report
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openClaimModal(client)}>
                          <AlertCircle className="h-4 w-4 mr-1" />
                          Claims
                        </Button>
                        <Button size="sm" variant="default" className="ml-auto" onClick={() => openPolicyModal(client)}>
                          <Plus className="h-4 w-4 mr-1" />
                          Add Policy
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Responsive table view for larger screens */}
          {filteredClients.length > 0 && (
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Address</th>
                    <th className="text-left py-3 px-4">Phone</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-right py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">{client.name || "Unnamed Client"}</td>
                      <td className="py-3 px-4">{client.address || "No address"}</td>
                      <td className="py-3 px-4">{formatPhoneNumber(client.phone || client.phone_number || "")}</td>
                      <td className="py-3 px-4">{client.email || "No email"}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => openEditModal(client)}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => openDeleteModal(client)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => openWhatsAppChat(client.phone || client.phone_number || "")}
                          >
                            <MessageCircle className="h-4 w-4" />
                            <span className="sr-only">WhatsApp</span>
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => openPolicyList(client)}>
                            <FileText className="h-4 w-4" />
                            <span className="sr-only">View Policies</span>
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => openReportModal(client)}>
                            <FileText className="h-4 w-4" />
                            <span className="sr-only">Report</span>
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => openClaimModal(client)}>
                            <AlertCircle className="h-4 w-4" />
                            <span className="sr-only">Claims</span>
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => openPolicyModal(client)}>
                            <Plus className="h-4 w-4 mr-1" />
                            Add Policy
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Client Form Modal */}
      <ClientForm
        isOpen={isClientFormOpen}
        onClose={() => {
          setIsClientFormOpen(false)
          setCurrentClient(null)
          setIsEditing(false)
          setEmailExists(false)
          setPhoneExists(false)
        }}
        onSave={isEditing ? handleEditClient : handleAddClient}
        client={currentClient}
        isEditing={isEditing}
        isSubmitting={formSubmitting}
        emailExists={emailExists}
        phoneExists={phoneExists}
      />

      {/* Policy Form Modal */}
      <PolicyForm
        isOpen={isPolicyFormOpen}
        onClose={() => {
          setIsPolicyFormOpen(false)
          setCurrentClient(null)
        }}
        onSave={handleAddPolicy}
        client={currentClient}
        isSubmitting={formSubmitting}
      />

      {/* Claim Form Modal */}
      <ClaimForm
        isOpen={isClaimFormOpen}
        onClose={() => {
          setIsClaimFormOpen(false)
          setCurrentClient(null)
        }}
        onSave={handleAddClaim}
        client={currentClient}
        isSubmitting={formSubmitting}
      />

      {/* Policy List Modal */}
      <PolicyList
        isOpen={isPolicyListOpen}
        onClose={() => {
          setIsPolicyListOpen(false)
          setCurrentClient(null)
        }}
        client={currentClient}
        onAddPolicy={() => {
          setIsPolicyListOpen(false)
          setTimeout(() => {
            setIsPolicyFormOpen(true)
          }, 100)
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false)
          setCurrentClient(null)
        }}
        onConfirm={handleDeleteClient}
        client={currentClient}
        isSubmitting={formSubmitting}
      />

      {/* Client Report Modal */}
      <ClientReport
        isOpen={isReportOpen}
        onClose={() => {
          setIsReportOpen(false)
          setCurrentClient(null)
        }}
        client={currentClient}
      />
    </div>
  )
}
