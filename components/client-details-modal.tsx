"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit,
  Trash2,
  MessageSquare,
  MessageCircle,
  FileText,
  Plus,
  AlertCircle,
  Calendar,
  Loader2,
  X,
} from "lucide-react"
import { SMSModal } from "@/components/sms-modal"
import { handleEmailClick } from "@/utils/native-email"
import { isMobileDevice } from "@/utils/sms-handler"
import PolicyForm from "@/app/(dashboard)/dashboard/clients/policy-form"
import ClaimForm from "@/app/(dashboard)/dashboard/clients/claim-form"
import PolicyList from "@/app/(dashboard)/dashboard/clients/policy-list"

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

interface Policy {
  id: string
  client_id: string
  policy_type: string
  policy_number: string
  start_date: string
  end_date: string
  premium_paid: number
  premium_amount?: number
  commission_rate?: number
  commission_amount?: number
  policy_provider?: string
  status?: string
  description?: string
  is_renewable?: boolean
  active?: boolean
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
  created_at?: string
}

interface ClientDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  client: Client | null
  onEdit: (client: Client) => void
  onDelete: (clientId: string) => void
  onRefresh: () => void
}

export function ClientDetailsModal({ isOpen, onClose, client, onEdit, onDelete, onRefresh }: ClientDetailsModalProps) {
  const [policies, setPolicies] = useState<Policy[]>([])
  const [claims, setClaims] = useState<Claim[]>([])
  const [loadingPolicies, setLoadingPolicies] = useState(false)
  const [loadingClaims, setLoadingClaims] = useState(false)
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false)
  const [isPolicyFormOpen, setIsPolicyFormOpen] = useState(false)
  const [isClaimFormOpen, setIsClaimFormOpen] = useState(false)
  const [isPolicyListOpen, setIsPolicyListOpen] = useState(false)
  const [formSubmitting, setFormSubmitting] = useState(false)

  const { toast } = useToast()
  const { user, profile } = useAuth()

  // Fetch client policies and claims when modal opens
  useEffect(() => {
    if (isOpen && client) {
      fetchClientData()
    }
  }, [isOpen, client])

  const fetchClientData = async () => {
    if (!client) return

    // Fetch policies
    setLoadingPolicies(true)
    try {
      const { data: policiesData, error: policiesError } = await supabase
        .from("policies")
        .select("*")
        .eq("client_id", client.id)
        .order("created_at", { ascending: false })

      if (policiesError) throw policiesError
      setPolicies(policiesData || [])
    } catch (err) {
      console.error("Error fetching policies:", err)
    } finally {
      setLoadingPolicies(false)
    }

    // Fetch claims
    setLoadingClaims(true)
    try {
      const { data: claimsData, error: claimsError } = await supabase
        .from("claims")
        .select("*")
        .eq("client_id", client.id)
        .order("created_at", { ascending: false })

      if (claimsError) throw claimsError
      setClaims(claimsData || [])
    } catch (err) {
      console.error("Error fetching claims:", err)
    } finally {
      setLoadingClaims(false)
    }
  }

  // Handle SMS click
  const handleSMSClick = () => {
    if (!client) return

    if (isMobileDevice()) {
      // On mobile, use native SMS
      const phone = formatPhoneForSMS(client.phone || client.phone_number)
      const message = `Hi ${client.name}, this is a reminder about your insurance policy. Please contact us for more details.\n\n— ${profile?.full_name || "AGENCYAPP Team"}`
      window.open(`sms:${phone}?body=${encodeURIComponent(message)}`)
    } else {
      // On desktop, show modal
      setIsSmsModalOpen(true)
    }
  }

  // Handle WhatsApp click
  const handleWhatsAppClick = () => {
    if (!client) return

    const phoneNumber = client.phone || client.phone_number
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
    if (!formattedPhone.startsWith("+")) {
      formattedPhone = `+${formattedPhone}`
    }
    formattedPhone = formattedPhone.replace(/\s+/g, "")

    window.open(`https://wa.me/${formattedPhone.replace("+", "")}`, "_blank")
  }

  // Handle adding a policy
  const handleAddPolicy = async (clientId: string, policy: Omit<Policy, "id" | "client_id">) => {
    if (!user) return

    setFormSubmitting(true)

    try {
      const payload = {
        client_id: clientId,
        policy_type: policy.policy_type,
        policy_number: policy.policy_number,
        start_date: policy.start_date,
        end_date: policy.end_date,
        premium_paid: policy.premium_paid || policy.premium_amount,
        premium_amount: policy.premium_amount || policy.premium_paid,
        commission_rate: policy.commission_rate || 0,
        commission_amount: policy.commission_amount || 0,
        policy_provider: policy.policy_provider,
        status: policy.status || "Active",
        description: policy.description || null,
        is_renewable: policy.is_renewable || false,
        active: policy.active !== undefined ? policy.active : policy.status === "Active",
      }

      const { data, error } = await supabase.from("policies").insert(payload).select()

      if (error) {
        if (error.code === "23505" && error.message.includes("unique_policy_per_client")) {
          toast({
            title: "Duplicate Policy Number",
            description: "This policy number already exists for this client.",
            variant: "destructive",
          })
        } else {
          throw error
        }
      } else {
        toast({
          title: "Policy Added Successfully",
          description: `Policy added successfully to ${client?.name}.`,
        })

        setIsPolicyFormOpen(false)
        fetchClientData() // Refresh data
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

  // Handle adding a claim
  const handleAddClaim = async (clientId: string, claim: Omit<Claim, "id" | "client_id">) => {
    if (!user) return

    setFormSubmitting(true)

    try {
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
      fetchClientData() // Refresh data
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

  // Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    if (!phone) return ""

    if (phone.startsWith("+233")) {
      return phone.replace(/(\+233)(\d{2})(\d{3})(\d{4})/, "$1 $2 $3 $4")
    }

    if (phone.startsWith("0")) {
      const withCountryCode = "+233" + phone.substring(1)
      return withCountryCode.replace(/(\+233)(\d{2})(\d{3})(\d{4})/, "$1 $2 $3 $4")
    }

    return phone
  }

  // Format phone for SMS
  const formatPhoneForSMS = (phone: string) => {
    if (!phone) return ""

    if (phone.startsWith("+233")) {
      return phone
    }

    if (phone.startsWith("0")) {
      return "+233" + phone.substring(1)
    }

    return phone.startsWith("+") ? phone : `+233${phone}`
  }

  // Calculate total premium
  const totalPremium = policies.reduce((sum, policy) => sum + (policy.premium_paid || 0), 0)

  // Get active policies
  const activePolicies = policies.filter((policy) => policy.status === "Active" || policy.active)

  if (!client) return null

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold">Client Details</DialogTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Client Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Client Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">{client.name}</h3>
                    <div className="space-y-2 mt-2">
                      {client.email && (
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span>{client.email}</span>
                        </div>
                      )}
                      {(client.phone || client.phone_number) && (
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{formatPhoneNumber(client.phone || client.phone_number)}</span>
                        </div>
                      )}
                      {client.address && (
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{client.address}</span>
                        </div>
                      )}
                      {client.created_at && (
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Joined {new Date(client.created_at).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-primary/10 rounded-lg">
                        <div className="text-2xl font-bold text-primary">{policies.length}</div>
                        <div className="text-sm text-muted-foreground">Total Policies</div>
                      </div>
                      <div className="text-center p-3 bg-green-100 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{activePolicies.length}</div>
                        <div className="text-sm text-muted-foreground">Active Policies</div>
                      </div>
                    </div>
                    <div className="text-center p-3 bg-blue-100 rounded-lg">
                      <div className="text-xl font-bold text-blue-600">₵{totalPremium.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Total Premium</div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => onEdit(client)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Client
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => onDelete(client.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                  <Button
                    variant="outline"
                    className="text-green-600 hover:text-green-700"
                    onClick={handleWhatsAppClick}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                  <Button variant="outline" className="text-blue-600 hover:text-blue-700" onClick={handleSMSClick}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    SMS
                  </Button>
                  <Button
                    variant="outline"
                    className="text-purple-600 hover:text-purple-700"
                    onClick={() => handleEmailClick(client)}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Policies Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Policies</span>
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => setIsPolicyListOpen(true)}>
                      <FileText className="h-4 w-4 mr-2" />
                      View All
                    </Button>
                    <Button size="sm" onClick={() => setIsPolicyFormOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Policy
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingPolicies ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : policies.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No policies found</p>
                ) : (
                  <div className="space-y-3">
                    {policies.slice(0, 3).map((policy) => (
                      <div key={policy.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{policy.policy_type}</div>
                          <div className="text-sm text-muted-foreground">
                            {policy.policy_number} • ₵{policy.premium_paid?.toLocaleString()}
                          </div>
                        </div>
                        <Badge variant={policy.status === "Active" || policy.active ? "default" : "secondary"}>
                          {policy.status || (policy.active ? "Active" : "Inactive")}
                        </Badge>
                      </div>
                    ))}
                    {policies.length > 3 && (
                      <p className="text-sm text-muted-foreground text-center">
                        And {policies.length - 3} more policies...
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Claims Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5" />
                    <span>Claims</span>
                  </CardTitle>
                  <Button size="sm" onClick={() => setIsClaimFormOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Claim
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingClaims ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : claims.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No claims found</p>
                ) : (
                  <div className="space-y-3">
                    {claims.slice(0, 3).map((claim) => (
                      <div key={claim.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{claim.claim_type}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(claim.claim_date).toLocaleDateString()} • {claim.location}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">₵{claim.amount.toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                    {claims.length > 3 && (
                      <p className="text-sm text-muted-foreground text-center">
                        And {claims.length - 3} more claims...
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* SMS Modal */}
      <SMSModal isOpen={isSmsModalOpen} onClose={() => setIsSmsModalOpen(false)} client={client} />

      {/* Policy Form Modal */}
      <PolicyForm
        isOpen={isPolicyFormOpen}
        onClose={() => setIsPolicyFormOpen(false)}
        onSave={handleAddPolicy}
        client={client}
        isSubmitting={formSubmitting}
      />

      {/* Claim Form Modal */}
      <ClaimForm
        isOpen={isClaimFormOpen}
        onClose={() => setIsClaimFormOpen(false)}
        onSave={handleAddClaim}
        client={client}
        isSubmitting={formSubmitting}
      />

      {/* Policy List Modal */}
      <PolicyList
        isOpen={isPolicyListOpen}
        onClose={() => setIsPolicyListOpen(false)}
        client={client}
        onAddPolicy={() => {
          setIsPolicyListOpen(false)
          setTimeout(() => setIsPolicyFormOpen(true), 100)
        }}
      />
    </>
  )
}
