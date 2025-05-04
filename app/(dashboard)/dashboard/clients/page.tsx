"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Search, Edit, Trash2, MessageCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"
import ClientForm from "./client-form"
import PolicyForm from "./policy-form"
import DeleteConfirmation from "./delete-confirmation"
import { Alert, AlertDescription } from "@/components/ui/alert"

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

// Define policy type
interface Policy {
  id: string
  client_id: string
  policy_type: string
  effective_date: string
  expiry_date: string
  premium_paid: number
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
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [currentClient, setCurrentClient] = useState<Client | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formSubmitting, setFormSubmitting] = useState(false)

  const { toast } = useToast()
  const { user } = useAuth()

  // Fetch clients on component mount
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
      const filtered = clients.filter(
        (client) => client.name.toLowerCase().includes(query) || client.email.toLowerCase().includes(query),
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

      setClients(data || [])
      setFilteredClients(data || [])
    } catch (err: any) {
      console.error("Error fetching clients:", err)
      setError(err.message || "Failed to fetch clients")
    } finally {
      setLoading(false)
    }
  }

  // Update the handleAddClient function to use the formatted phone number
  const handleAddClient = async (client: Omit<Client, "id" | "created_by">) => {
    if (!user) return

    setFormSubmitting(true)

    try {
      const newClient = {
        created_by: user.id,
        name: client.name,
        address: client.address,
        phone: client.phone_number, // Use the same formatted number for both fields
        phone_number: client.phone_number,
        email: client.email,
      }

      const { data, error } = await supabase.from("clients").insert([newClient]).select()

      if (error) throw error

      if (data && data.length > 0) {
        setClients([data[0], ...clients])
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
        description: err.message || "Failed to add client",
        variant: "destructive",
      })
    } finally {
      setFormSubmitting(false)
    }
  }

  // Update the handleEditClient function to use the formatted phone number
  const handleEditClient = async (updatedClient: Client) => {
    if (!user) return

    setFormSubmitting(true)

    try {
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
      const newPolicy = {
        client_id: clientId,
        policy_type: policy.policy_type,
        effective_date: policy.effective_date,
        expiry_date: policy.expiry_date,
        premium_paid: policy.premium_paid,
      }

      const { error } = await supabase.from("policies").insert([newPolicy])

      if (error) throw error

      toast({
        title: "Policy Added",
        description: `New ${policy.policy_type} policy has been added successfully.`,
      })

      setIsPolicyFormOpen(false)
      setCurrentClient(null)
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

  // Update the openWhatsAppChat function to use the phone number with country code
  const openWhatsAppChat = (phoneNumber: string) => {
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">Manage your client information and policies</p>
        </div>
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
                        <h3 className="font-semibold text-lg">{client.name}</h3>
                        <p className="text-sm text-muted-foreground">{client.email}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-start">
                          <span className="font-medium text-sm w-20">Address:</span>
                          <span className="text-sm">{client.address}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium text-sm w-20">Phone:</span>
                          <span className="text-sm">{formatPhoneNumber(client.phone || client.phone_number)}</span>
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
                          onClick={() => openWhatsAppChat(client.phone || client.phone_number)}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          WhatsApp
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
                      <td className="py-3 px-4">{client.name}</td>
                      <td className="py-3 px-4">{client.address}</td>
                      <td className="py-3 px-4">{formatPhoneNumber(client.phone || client.phone_number)}</td>
                      <td className="py-3 px-4">{client.email}</td>
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
                            onClick={() => openWhatsAppChat(client.phone || client.phone_number)}
                          >
                            <MessageCircle className="h-4 w-4" />
                            <span className="sr-only">WhatsApp</span>
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
        }}
        onSave={isEditing ? handleEditClient : handleAddClient}
        client={currentClient}
        isEditing={isEditing}
        isSubmitting={formSubmitting}
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
    </div>
  )
}
