"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"

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
  effective_date: string
  expiry_date: string
  premium_paid: number
  created_at?: string
}

interface PolicyListProps {
  isOpen: boolean
  onClose: () => void
  client: Client | null
  onAddPolicy: () => void
}

export default function PolicyList({ isOpen, onClose, client, onAddPolicy }: PolicyListProps) {
  const [policies, setPolicies] = useState<Policy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && client) {
      fetchPolicies(client.id)
    }
  }, [isOpen, client])

  const fetchPolicies = async (clientId: string) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from("policies")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false })

      if (error) throw error

      setPolicies(data || [])
    } catch (err: any) {
      console.error("Error fetching policies:", err)
      setError("Failed to load policies. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const isPolicyActive = (expiryDate: string) => {
    return new Date(expiryDate) > new Date()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Policies for {client?.name}</DialogTitle>
          <DialogDescription>View all policies associated with this client</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium">
              {policies.length} {policies.length === 1 ? "Policy" : "Policies"}
            </h3>
            <Button size="sm" onClick={onAddPolicy}>
              <Plus className="h-4 w-4 mr-1" />
              Add Policy
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : policies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No policies found for this client</p>
              <Button variant="outline" className="mt-4" onClick={onAddPolicy}>
                <Plus className="h-4 w-4 mr-1" />
                Add First Policy
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {policies.map((policy) => (
                <div key={policy.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{policy.policy_type}</h4>
                        <Badge variant={isPolicyActive(policy.expiry_date) ? "default" : "destructive"}>
                          {isPolicyActive(policy.expiry_date) ? "Active" : "Expired"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Effective Date:</span>{" "}
                          {formatDate(policy.effective_date)}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Expiry Date:</span> {formatDate(policy.expiry_date)}
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Premium:</span> GHC {policy.premium_paid.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
