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
import { Loader2, DollarSign, Percent, AlertCircle } from "lucide-react"
import { FormControl } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Client {
  id: string
  user_id: string
  full_name: string
  address: string
  phone: string
  email: string
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
  commission_rate?: number
  commission_amount?: number
  active?: boolean
  created_at?: string
}

interface PolicyFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (clientId: string, policy: any) => void
  client: Client | null
  isSubmitting: boolean
}

// Policy types for datalist
const policyTypes = ["Motor", "Fire and Burglary", "Travel", "Performance Bond", "CAR"]

export default function PolicyForm({ isOpen, onClose, onSave, client, isSubmitting }: PolicyFormProps) {
  const [formData, setFormData] = useState({
    policy_type: "",
    policy_number: "",
    effective_date: "",
    expiry_date: "",
    premium_paid: "",
    commission_rate: "10", // Default commission rate of 10%
  })

  const [active, setActive] = useState(true) // Default to active
  const [commissionAmount, setCommissionAmount] = useState<number | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  const [errors, setErrors] = useState({
    policy_type: "",
    policy_number: "",
    effective_date: "",
    expiry_date: "",
    premium_paid: "",
    commission_rate: "",
  })

  // Generate a policy number when the form opens
  useEffect(() => {
    if (isOpen) {
      // Set today's date as default for effective date
      const today = new Date().toISOString().split("T")[0]

      // Set default expiry date as 1 year from today
      const nextYear = new Date()
      nextYear.setFullYear(nextYear.getFullYear() + 1)
      const defaultExpiryDate = nextYear.toISOString().split("T")[0]

      // Generate a policy number
      const policyNumber = generatePolicyNumber()

      setFormData({
        policy_type: "",
        policy_number: policyNumber,
        effective_date: today,
        expiry_date: defaultExpiryDate,
        premium_paid: "",
        commission_rate: "10", // Default commission rate
      })
      setActive(true) // Reset active status
      setCommissionAmount(null) // Reset commission amount
      setDebugInfo(null) // Clear debug info
    }

    // Clear errors
    setErrors({
      policy_type: "",
      policy_number: "",
      effective_date: "",
      expiry_date: "",
      premium_paid: "",
      commission_rate: "",
    })
  }, [isOpen])

  // Generate a policy number
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
    const premium = Number.parseFloat(formData.premium_paid)
    const rate = Number.parseFloat(formData.commission_rate)

    if (!isNaN(premium) && !isNaN(rate)) {
      const amount = (premium * rate) / 100
      setCommissionAmount(amount)
    } else {
      setCommissionAmount(null)
    }
  }, [formData.premium_paid, formData.commission_rate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error for this field
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  // Validate policy using the provided validation function
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

  const validateForm = () => {
    let isValid = true
    const newErrors = {
      policy_type: "",
      policy_number: "",
      effective_date: "",
      expiry_date: "",
      premium_paid: "",
      commission_rate: "",
    }

    // Validate policy type
    if (!formData.policy_type.trim()) {
      newErrors.policy_type = "Policy type is required"
      isValid = false
    }

    // Validate policy number
    if (!formData.policy_number.trim()) {
      newErrors.policy_number = "Policy number is required"
      isValid = false
    }

    // Validate effective date
    if (!formData.effective_date) {
      newErrors.effective_date = "Effective date is required"
      isValid = false
    }

    // Validate expiry date
    if (!formData.expiry_date) {
      newErrors.expiry_date = "Expiry date is required"
      isValid = false
    } else if (new Date(formData.expiry_date) <= new Date(formData.effective_date)) {
      newErrors.expiry_date = "Expiry date must be after effective date"
      isValid = false
    }

    // Validate premium paid
    if (!formData.premium_paid) {
      newErrors.premium_paid = "Premium amount is required"
      isValid = false
    } else if (isNaN(Number(formData.premium_paid)) || Number(formData.premium_paid) <= 0) {
      newErrors.premium_paid = "Please enter a valid premium amount"
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

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm() && client) {
      // Calculate commission amount
      const premium = Number.parseFloat(formData.premium_paid)
      const rate = Number.parseFloat(formData.commission_rate)
      const commission = (premium * rate) / 100

      const policyData = {
        ...formData,
        client_id: client.id,
        premium_paid: Number(formData.premium_paid),
        commission_rate: Number(formData.commission_rate),
        commission_amount: commission,
        active: active,
      }

      // Log the policy data being submitted for debugging
      console.log("Submitting policy:", policyData)

      // Check if the policy is valid using the validation function
      if (
        !isValidPolicy({
          ...policyData,
          premium: policyData.premium_paid, // Map to the expected field name in validation
          start_date: policyData.effective_date, // Map to the expected field name in validation
          end_date: policyData.expiry_date, // Map to the expected field name in validation
        })
      ) {
        setDebugInfo("Policy validation failed. Check console for details.")
        console.error("Invalid policy data:", policyData)
        return
      }

      // If validation passes, save the policy
      try {
        onSave(client.id, policyData)
      } catch (error) {
        console.error("Error:", error)
        setDebugInfo(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
    }
  }

  // Format currency for display
  const formatCurrency = (value: string) => {
    if (!value) return ""
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 2,
    }).format(Number.parseFloat(value))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Policy</DialogTitle>
          <DialogDescription>
            {client ? `Add a new policy for ${client.full_name}` : "Add a new policy"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {debugInfo && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{debugInfo}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="policy_type">Policy Type</Label>
            <div className="relative">
              <Input
                id="policy_type"
                name="policy_type"
                value={formData.policy_type}
                onChange={handleChange}
                list="policy-types"
                className={errors.policy_type ? "border-red-500" : ""}
                placeholder="Select or type a policy type"
                disabled={isSubmitting}
              />
              <datalist id="policy-types">
                {policyTypes.map((type) => (
                  <option key={type} value={type} />
                ))}
              </datalist>
            </div>
            {errors.policy_type && <p className="text-sm text-red-500">{errors.policy_type}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="policy_number">Policy Number</Label>
            <Input
              id="policy_number"
              name="policy_number"
              value={formData.policy_number}
              onChange={handleChange}
              className={errors.policy_number ? "border-red-500" : ""}
              disabled={true} // Auto-generated, so disabled
            />
            {errors.policy_number && <p className="text-sm text-red-500">{errors.policy_number}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="effective_date">Effective Date</Label>
            <Input
              id="effective_date"
              name="effective_date"
              type="date"
              value={formData.effective_date}
              onChange={handleChange}
              className={errors.effective_date ? "border-red-500" : ""}
              disabled={isSubmitting}
            />
            {errors.effective_date && <p className="text-sm text-red-500">{errors.effective_date}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiry_date">Expiry Date</Label>
            <Input
              id="expiry_date"
              name="expiry_date"
              type="date"
              value={formData.expiry_date}
              onChange={handleChange}
              className={errors.expiry_date ? "border-red-500" : ""}
              disabled={isSubmitting}
            />
            {errors.expiry_date && <p className="text-sm text-red-500">{errors.expiry_date}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="premium_paid">Premium Paid (GHC)</Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <DollarSign className="h-4 w-4" />
              </div>
              <Input
                id="premium_paid"
                name="premium_paid"
                type="number"
                min="0"
                step="0.01"
                value={formData.premium_paid}
                onChange={handleChange}
                className={`pl-10 ${errors.premium_paid ? "border-red-500" : ""}`}
                placeholder="0.00"
                disabled={isSubmitting}
              />
            </div>
            {errors.premium_paid && <p className="text-sm text-red-500">{errors.premium_paid}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="commission_rate">Commission Rate (%)</Label>
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

          {commissionAmount !== null && (
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm font-medium">Commission Amount: {formatCurrency(commissionAmount.toString())}</p>
            </div>
          )}

          <FormControl>
            <div className="flex items-center justify-between">
              <Label htmlFor="active" className="cursor-pointer">
                Active Status
              </Label>
              <Switch id="active" checked={active} onCheckedChange={setActive} disabled={isSubmitting} />
            </div>
          </FormControl>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Save Policy"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
