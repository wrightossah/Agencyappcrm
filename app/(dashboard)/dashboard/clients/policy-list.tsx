"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Plus, Calendar, DollarSign, Building, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
    return new Date(dateString).toLocaleDateString("en-GH", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "expired":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const isPolicyActive = (policy: Policy) => {
    if (policy.status === "Active") {
      return new Date(policy.end_date) > new Date()
    }
    return false
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Policies for {client?.name}</DialogTitle>
          <DialogDescription>View and manage all policies for this client</DialogDescription>
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
            <div className="text-center py-8">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-500">{error}</p>
            </div>
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
                <Card key={policy.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {policy.policy_type}
                          <Badge className={getStatusColor(policy.status || "Active")}>
                            {policy.status || "Active"}
                          </Badge>
                          {policy.is_renewable && (
                            <Badge variant="outline" className="text-blue-600 border-blue-200">
                              Renewable
                            </Badge>
                          )}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground font-mono">{policy.policy_number}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(policy.premium_paid || policy.premium_amount || 0)}
                        </p>
                        {policy.commission_amount && (
                          <p className="text-sm text-muted-foreground">
                            Commission: {formatCurrency(policy.commission_amount)}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Start Date</p>
                          <p className="text-muted-foreground">{formatDate(policy.start_date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">End Date</p>
                          <p className="text-muted-foreground">{formatDate(policy.end_date)}</p>
                        </div>
                      </div>
                      {policy.policy_provider && (
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Provider</p>
                            <p className="text-muted-foreground">{policy.policy_provider}</p>
                          </div>
                        </div>
                      )}
                      {policy.commission_rate && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Commission Rate</p>
                            <p className="text-muted-foreground">{policy.commission_rate}%</p>
                          </div>
                        </div>
                      )}
                    </div>
                    {policy.description && (
                      <div className="mt-4 p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium mb-1">Notes</p>
                        <p className="text-sm text-muted-foreground">{policy.description}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
