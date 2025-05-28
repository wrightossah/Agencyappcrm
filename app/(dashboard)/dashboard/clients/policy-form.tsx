"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2, Calculator, Percent } from "lucide-react"
import { supabase } from "@/lib/supabase"

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

interface PolicyFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (clientId: string, policy: any) => void
  client: Client | null
  isSubmitting: boolean
}

// Policy types and statuses
const policyTypes = ["Motor", "Travel", "GIT", "Bonds", "Marine", "CAR", "Other"]
const policyStatuses = ["Active", "Expired", "Cancelled"]

export default function PolicyForm({ isOpen, onClose, onSave, client, isSubmitting }: PolicyFormProps) {
  const [formData, setFormData] = useState({
    policy_type: "",
    custom_policy_type: "",
    policy_number: "",
    start_date: "",
    end_date: "",
    premium_amount: "",
    commission_rate: "10", // Default commission rate of 10%
    policy_provider: "",
    status: "Active", // Default status
    description: "",
  })

  const [isRenewable, setIsRenewable] = useState(false)
  const [commissionAmount, setCommissionAmount] = useState<number | null>(null)
  const [duplicateError, setDuplicateError] = useState("")
  const [checkingDuplicate, setCheckingDuplicate] = useState(false)

  const [errors, setErrors] = useState({
    policy_type: "",
    custom_policy_type: "",
    policy_number: "",
    start_date: "",
    end_date: "",
    premium_amount: "",
    commission_rate: "",
    policy_provider: "",
    status: "",
  })

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // Set today's date as default for start date
      const today = new Date().toISOString().split("T")[0]

      // Set default end date as 1 year from today
      const nextYear = new Date()
      nextYear.setFullYear(nextYear.getFullYear() + 1)
      const defaultEndDate = nextYear.toISOString().split("T")[0]

      // Generate a policy number
      const policyNumber = generatePolicyNumber()

      setFormData({
        policy_type: "",
        custom_policy_type: "",
        policy_number: policyNumber,
        start_date: today,
        end_date: defaultEndDate,
        premium_amount: "",
        commission_rate: "10",
        policy_provider: "",
        status: "Active",
        description: "",
      })
      setIsRenewable(false)
      setCommissionAmount(null)
      setDuplicateError("")
    }

    // Clear errors
    setErrors({
      policy_type: "",
      custom_policy_type: "",
      policy_number: "",
      start_date: "",
      end_date: "",
      premium_amount: "",
      commission_rate: "",
      policy_provider: "",
      status: "",
    })
  }, [isOpen])

  // Generate a unique policy number
  const generatePolicyNumber = () => {
    const prefix = "POL"
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    return `${prefix}-${timestamp}-${random}`
  }

  // Calculate commission amount when premium or rate changes
  useEffect(() => {
    const premium = Number.parseFloat(formData.premium_amount)
    const rate = Number.parseFloat(formData.commission_rate)

    if (!isNaN(premium) && !isNaN(rate)) {
      const amount = (premium * rate) / 100
      setCommissionAmount(amount)
    } else {
      setCommissionAmount(null)
    }
  }, [formData.premium_amount, formData.commission_rate])

  // Check for duplicate policy number when policy number changes
  useEffect(() => {
    if (formData.policy_number && client) {
      checkDuplicatePolicyNumber(formData.policy_number, client.id)
    }
  }, [formData.policy_number, client])

  const checkDuplicatePolicyNumber = async (policyNumber: string, clientId: string) => {
    if (!policyNumber.trim() || !clientId) return

    setCheckingDuplicate(true)
    setDuplicateError("")

    try {
      const { data, error } = await supabase
        .from("policies")
        .select("id")
        .eq("client_id", clientId)
        .eq("policy_number", policyNumber.trim())

      if (error) throw error

      if (data && data.length > 0) {
        setDuplicateError("This policy number already exists for this client. Please use a unique policy number.")
      }
    } catch (error) {
      console.error("Error checking duplicate policy number:", error)
    } finally {
      setCheckingDuplicate(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error for this field
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }

    // Clear duplicate error when policy number changes
    if (name === "policy_number") {
      setDuplicateError("")
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error for this field
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }

    // Clear custom policy type if not "Other"
    if (name === "policy_type" && value !== "Other") {
      setFormData((prev) => ({ ...prev, custom_policy_type: "" }))
      setErrors((prev) => ({ ...prev, custom_policy_type: "" }))
    }
  }

  const validateForm = () => {
    let isValid = true
    const newErrors = {
      policy_type: "",
      custom_policy_type: "",
      policy_number: "",
      start_date: "",
      end_date: "",
      premium_amount: "",
      commission_rate: "",
      policy_provider: "",
      status: "",
    }

    // Validate policy type
    if (!formData.policy_type.trim()) {
      newErrors.policy_type = "Policy type is required"
      isValid = false
    }

    // Validate custom policy type if "Other" is selected
    if (formData.policy_type === "Other" && !formData.custom_policy_type.trim()) {
      newErrors.custom_policy_type = "Please specify the policy type"
      isValid = false
    }

    // Validate policy number
    if (!formData.policy_number.trim()) {
      newErrors.policy_number = "Policy number is required"
      isValid = false
    }

    // Check for duplicate policy number
    if (duplicateError) {
      newErrors.policy_number = duplicateError
      isValid = false
    }

    // Validate start date
    if (!formData.start_date) {
      newErrors.start_date = "Start date is required"
      isValid = false
    }

    // Validate end date
    if (!formData.end_date) {
      newErrors.end_date = "End date is required"
      isValid = false
    } else if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      newErrors.end_date = "End date must be after start date"
      isValid = false
    }

    // Validate premium amount
    if (!formData.premium_amount) {
      newErrors.premium_amount = "Premium amount is required"
      isValid = false
    } else if (isNaN(Number(formData.premium_amount)) || Number(formData.premium_amount) <= 0) {
      newErrors.premium_amount = "Please enter a valid premium amount"
      isValid = false
    }

    // Validate commission rate
    if (!formData.commission_rate) {
      newErrors.commission_rate = "Commission rate is required"
      isValid = false
    } else {
      const rate = Number.parseFloat(formData.commission_rate)
      if (isNaN(rate) || rate < 0 || rate > 100) {
        newErrors.commission_rate = "Commission rate must be between 0 and 100"
        isValid = false
      }
    }

    // Validate policy provider
    if (!formData.policy_provider.trim()) {
      newErrors.policy_provider = "Policy provider is required"
      isValid = false
    }

    // Validate status
    if (!formData.status) {
      newErrors.status = "Status is required"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm() && client && !duplicateError && !checkingDuplicate) {
      // Calculate commission amount
      const premium = Number.parseFloat(formData.premium_amount)
      const rate = Number.parseFloat(formData.commission_rate)
      const commission = (premium * rate) / 100

      // Determine the final policy type (either selected or custom)
      const finalPolicyType =
        formData.policy_type === "Other" ? formData.custom_policy_type.trim() : formData.policy_type

      const policyData = {
        policy_type: finalPolicyType,
        policy_number: formData.policy_number.trim(),
        start_date: formData.start_date,
        end_date: formData.end_date,
        premium_paid: premium, // Map to existing field name
        premium_amount: premium, // Also include new field name
        commission_rate: rate,
        commission_amount: commission,
        policy_provider: formData.policy_provider.trim(),
        status: formData.status,
        description: formData.description.trim() || null,
        is_renewable: isRenewable,
        active: formData.status === "Active", // Set active based on status
      }

      onSave(client.id, policyData)
    }
  }

  // Format currency for display
  const formatCurrency = (value: number) => {
    return `Ghc ${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Policy</DialogTitle>
          <DialogDescription>{client ? `Add a new policy for ${client.name}` : "Add a new policy"}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Policy Type */}
          <div className="space-y-2">
            <Label htmlFor="policy_type">Policy Type *</Label>
            <Select value={formData.policy_type} onValueChange={(value) => handleSelectChange("policy_type", value)}>
              <SelectTrigger className={errors.policy_type ? "border-red-500" : ""}>
                <SelectValue placeholder="Select policy type" />
              </SelectTrigger>
              <SelectContent>
                {policyTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.policy_type && <p className="text-sm text-red-500">{errors.policy_type}</p>}
          </div>

          {/* Custom Policy Type - Only shown when "Other" is selected */}
          {formData.policy_type === "Other" && (
            <div className="space-y-2">
              <Label htmlFor="custom_policy_type">Specify Policy Type *</Label>
              <Input
                id="custom_policy_type"
                name="custom_policy_type"
                value={formData.custom_policy_type}
                onChange={handleChange}
                className={errors.custom_policy_type ? "border-red-500" : ""}
                placeholder="Enter custom policy type"
                disabled={isSubmitting}
              />
              {errors.custom_policy_type && <p className="text-sm text-red-500">{errors.custom_policy_type}</p>}
            </div>
          )}

          {/* Policy Number */}
          <div className="space-y-2">
            <Label htmlFor="policy_number">Policy Number *</Label>
            <div className="relative">
              <Input
                id="policy_number"
                name="policy_number"
                value={formData.policy_number}
                onChange={handleChange}
                className={errors.policy_number || duplicateError ? "border-red-500" : ""}
                disabled={isSubmitting}
                placeholder="Enter unique policy number"
              />
              {checkingDuplicate && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
            {(errors.policy_number || duplicateError) && (
              <p className="text-sm text-red-500">{errors.policy_number || duplicateError}</p>
            )}
          </div>

          {/* Date Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                value={formData.start_date}
                onChange={handleChange}
                className={errors.start_date ? "border-red-500" : ""}
                disabled={isSubmitting}
              />
              {errors.start_date && <p className="text-sm text-red-500">{errors.start_date}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date *</Label>
              <Input
                id="end_date"
                name="end_date"
                type="date"
                value={formData.end_date}
                onChange={handleChange}
                className={errors.end_date ? "border-red-500" : ""}
                disabled={isSubmitting}
              />
              {errors.end_date && <p className="text-sm text-red-500">{errors.end_date}</p>}
            </div>
          </div>

          {/* Premium and Commission */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="premium_amount">Premium Amount (Ghc) *</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Ghc</div>
                <Input
                  id="premium_amount"
                  name="premium_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.premium_amount}
                  onChange={handleChange}
                  className={`pl-10 ${errors.premium_amount ? "border-red-500" : ""}`}
                  placeholder="0.00"
                  disabled={isSubmitting}
                />
              </div>
              {errors.premium_amount && <p className="text-sm text-red-500">{errors.premium_amount}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="commission_rate">Commission Rate (%) *</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <Percent className="h-4 w-4" />
                </div>
                <Input
                  id="commission_rate"
                  name="commission_rate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.commission_rate}
                  onChange={handleChange}
                  className={`pl-10 ${errors.commission_rate ? "border-red-500" : ""}`}
                  placeholder="10.00"
                  disabled={isSubmitting}
                />
              </div>
              {errors.commission_rate && <p className="text-sm text-red-500">{errors.commission_rate}</p>}
            </div>
          </div>

          {/* Commission Amount Display */}
          {commissionAmount !== null && (
            <div className="rounded-md bg-green-50 border border-green-200 p-3">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-green-600" />
                <p className="text-sm font-medium text-green-800">
                  Commission Amount: {formatCurrency(commissionAmount)}
                </p>
              </div>
            </div>
          )}

          {/* Policy Provider and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="policy_provider">Policy Provider *</Label>
              <Input
                id="policy_provider"
                name="policy_provider"
                value={formData.policy_provider}
                onChange={handleChange}
                className={errors.policy_provider ? "border-red-500" : ""}
                placeholder="e.g., Enterprise Insurance"
                disabled={isSubmitting}
              />
              {errors.policy_provider && <p className="text-sm text-red-500">{errors.policy_provider}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                <SelectTrigger className={errors.status ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {policyStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
            </div>
          </div>

          {/* Renewable Toggle */}
          <div className="flex items-center justify-between p-3 rounded-md bg-muted">
            <div>
              <Label htmlFor="renewable" className="cursor-pointer font-medium">
                Renewable Policy
              </Label>
              <p className="text-sm text-muted-foreground">Mark this policy as renewable/recurring</p>
            </div>
            <Switch id="renewable" checked={isRenewable} onCheckedChange={setIsRenewable} disabled={isSubmitting} />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description or Notes (Optional)</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add any additional notes about this policy..."
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !!duplicateError || checkingDuplicate}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Policy"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
