"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Search, Loader2, User, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"
import ClientForm from "./client-form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ClientDetailsModal } from "@/components/client-details-modal"
import DeleteConfirmation from "./delete-confirmation"

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
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal states
  const [isClientFormOpen, setIsClientFormOpen] = useState(false)
  const [isClientDetailsOpen, setIsClientDetailsOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [deleteSubmitting, setDeleteSubmitting] = useState(false)

  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchClients()
    }
  }, [user])

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

  const fetchClients = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("created_by", user.id)
        .order("name", { ascending: true })

      if (error) throw error

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

  const handleAddClient = async (client: Omit<Client, "id" | "created_by">) => {
    if (!user) return

    setFormSubmitting(true)

    try {
      const newClient = {
        created_by: user.id,
        name: client.name,
        address: client.address,
        phone: client.phone_number,
        phone_number: client.phone_number,
        email: client.email,
      }

      const { data, error } = await supabase.from("clients").insert([newClient]).select("*")

      if (error) throw error

      if (data && data.length > 0) {
        const updatedClients = [...clients, data[0]].sort((a, b) => a.name.localeCompare(b.name))
        setClients(updatedClients)

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

  const handleEditClient = async (updatedClient: Client) => {
    if (!user) return

    setFormSubmitting(true)

    try {
      const { error } = await supabase
        .from("clients")
        .update({
          name: updatedClient.name,
          address: updatedClient.address,
          phone: updatedClient.phone_number,
          phone_number: updatedClient.phone_number,
          email: updatedClient.email,
        })
        .eq("id", updatedClient.id)
        .eq("created_by", user.id)

      if (error) throw error

      const updatedClients = clients
        .map((client) => (client.id === updatedClient.id ? updatedClient : client))
        .sort((a, b) => a.name.localeCompare(b.name))

      setClients(updatedClients)

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

  const handleClientClick = (client: Client) => {
    setSelectedClient(client)
    setIsClientDetailsOpen(true)
  }

  const handleEditFromDetails = (client: Client) => {
    setSelectedClient(client)
    setIsEditing(true)
    setIsClientDetailsOpen(false)
    setIsClientFormOpen(true)
  }

  const handleDeleteRequest = (client: Client) => {
    setSelectedClient(client)
    setIsDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!user || !selectedClient) return

    setDeleteSubmitting(true)

    try {
      const { error } = await supabase.from("clients").delete().eq("id", selectedClient.id).eq("created_by", user.id)

      if (error) throw error

      const updatedClients = clients.filter((client) => client.id !== selectedClient.id)
      setClients(updatedClients)

      setIsDeleteConfirmOpen(false)
      setIsClientDetailsOpen(false)
      setSelectedClient(null)

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
    } finally {
      setDeleteSubmitting(false)
    }
  }

  const handleDataReset = async () => {
    if (!user) return

    try {
      // Delete all clients for this user
      const { error } = await supabase.from("clients").delete().eq("created_by", user.id)

      if (error) throw error

      setClients([])
      setFilteredClients([])

      toast({
        title: "Data Reset",
        description: "All client data has been reset successfully.",
      })
    } catch (err: any) {
      console.error("Error resetting data:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to reset data",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">Manage your client information</p>
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
          {/* Client List */}
          {filteredClients.length === 0 ? (
            <div className="text-center py-10">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <User className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{searchQuery ? "No clients found" : "No clients yet"}</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Start building your client base by adding your first client"}
              </p>
              <div className="flex gap-2 justify-center">
                {!searchQuery && (
                  <Button
                    onClick={() => {
                      setSelectedClient(null)
                      setIsEditing(false)
                      setIsClientFormOpen(true)
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Client
                  </Button>
                )}
                {clients.length > 0 && (
                  <Button variant="outline" onClick={handleDataReset}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reset Data
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredClients.map((client) => (
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
        }}
        onSave={isEditing ? handleEditClient : handleAddClient}
        client={selectedClient}
        isEditing={isEditing}
        isSubmitting={formSubmitting}
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
        onDelete={handleDeleteRequest}
        onRefresh={fetchClients}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false)
          setSelectedClient(null)
        }}
        onConfirm={handleDeleteConfirm}
        client={selectedClient}
        isSubmitting={deleteSubmitting}
      />
    </div>
  )
}
