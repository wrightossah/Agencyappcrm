"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Search, Loader2, ArrowLeft, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import ClientForm from "./client-form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ensureAgentsTable, addCurrentUserAsAgent } from "./actions"
import { ClientDetailsModal } from "@/components/client-details-modal"

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

export default function ClientsPage() {
  // State for clients data
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State for modals
  const [isClientFormOpen, setIsClientFormOpen] = useState(false)
  const [isClientDetailsOpen, setIsClientDetailsOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
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
      const filtered = clients.filter((client) => (client.name?.toLowerCase() || "").includes(query))
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
        .order("name", { ascending: true }) // Sort by name alphabetically

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
        // Add the new client and re-sort
        const updatedClients = [...clients, data[0]].sort((a, b) => a.name.localeCompare(b.name))
        setClients(updatedClients)

        // Also update filtered clients if search query is empty
        if (searchQuery.trim() === "") {
          setFilteredClients(updatedClients)
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

  // Handle editing a client
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

      // Update the clients list and re-sort
      const updatedClients = clients
        .map((client) => (client.id === updatedClient.id ? updatedClient : client))
        .sort((a, b) => a.name.localeCompare(b.name))

      setClients(updatedClients)

      // Update selected client if it's the one being edited
      if (selectedClient?.id === updatedClient.id) {
        setSelectedClient(updatedClient)
      }

      toast({
        title: "Client Updated",
        description: `${updatedClient.name} has been updated successfully.`,
      })

      setIsClientFormOpen(false)
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

  // Handle client click to show details
  const handleClientClick = (client: Client) => {
    setSelectedClient(client)
    setIsClientDetailsOpen(true)
  }

  // Handle edit client from details modal
  const handleEditFromDetails = (client: Client) => {
    setSelectedClient(client)
    setIsEditing(true)
    setIsClientDetailsOpen(false)
    setIsClientFormOpen(true)
  }

  // Handle client deletion
  const handleDeleteClient = async (clientId: string) => {
    if (!user) return

    try {
      const { error } = await supabase.from("clients").delete().eq("id", clientId).eq("created_by", user.id)

      if (error) throw error

      // Remove from clients list
      const updatedClients = clients.filter((client) => client.id !== clientId)
      setClients(updatedClients)

      // Close details modal if the deleted client was selected
      if (selectedClient?.id === clientId) {
        setIsClientDetailsOpen(false)
        setSelectedClient(null)
      }

      toast({
        title: "Client Deleted",
        description: "Client has been deleted successfully.",
      })
    } catch (err: any) {
      console.error("Error deleting client:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to delete client",
        variant: "destructive",
      })
    }
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
              setSelectedClient(null)
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
          placeholder="Search clients by name..."
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
          {/* Simple Client List */}
          {filteredClients.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "No clients found matching your search" : "No clients found"}
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedClient(null)
                  setIsEditing(false)
                  setIsClientFormOpen(true)
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Client
              </Button>
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredClients.map((client, index) => (
                    <div
                      key={client.id}
                      className="flex items-center p-4 hover:bg-muted/50 cursor-pointer transition-colors duration-150"
                      onClick={() => handleClientClick(client)}
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-lg truncate">{client.name || "Unnamed Client"}</h3>
                          <p className="text-sm text-muted-foreground">Click to view details</p>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {client.created_at ? new Date(client.created_at).toLocaleDateString() : ""}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Client count */}
          {filteredClients.length > 0 && (
            <div className="text-center text-sm text-muted-foreground">
              {searchQuery
                ? `${filteredClients.length} client${filteredClients.length === 1 ? "" : "s"} found`
                : `${filteredClients.length} total client${filteredClients.length === 1 ? "" : "s"}`}
            </div>
          )}
        </>
      )}

      {/* Client Form Modal */}
      <ClientForm
        isOpen={isClientFormOpen}
        onClose={() => {
          setIsClientFormOpen(false)
          setSelectedClient(null)
          setIsEditing(false)
          setEmailExists(false)
          setPhoneExists(false)
        }}
        onSave={isEditing ? handleEditClient : handleAddClient}
        client={selectedClient}
        isEditing={isEditing}
        isSubmitting={formSubmitting}
        emailExists={emailExists}
        phoneExists={phoneExists}
      />

      {/* Client Details Modal */}
      <ClientDetailsModal
        isOpen={isClientDetailsOpen}
        onClose={() => {
          setIsClientDetailsOpen(false)
          setSelectedClient(null)
        }}
        client={selectedClient}
        onEdit={handleEditFromDetails}
        onDelete={handleDeleteClient}
        onRefresh={fetchClients}
      />
    </div>
  )
}
