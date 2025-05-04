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
import { Loader2 } from "lucide-react"

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
  effective_date: string
  expiry_date: string
  premium_paid: number
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
    effective_date: "",
    expiry_date: "",
    premium_paid: "",
  })

  const [errors, setErrors] = useState({
    policy_type: "",
    effective_date: "",
    expiry_date: "",
    premium_paid: "",
  })

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // Set today's date as default for effective date
      const today = new Date().toISOString().split("T")[0]

      // Set default expiry date as 1 year from today
      const nextYear = new Date()
      nextYear.setFullYear(nextYear.getFullYear() + 1)
      const defaultExpiryDate = nextYear.toISOString().split("T")[0]

      setFormData({
        policy_type: "",
        effective_date: today,
        expiry_date: defaultExpiryDate,
        premium_paid: "",
      })
    }

    // Clear errors
    setErrors({
      policy_type: "",
      effective_date: "",
      expiry_date: "",
      premium_paid: "",
    })
  }, [isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error for this field
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    let isValid = true
    const newErrors = {
      policy_type: "",
      effective_date: "",
      expiry_date: "",
      premium_paid: "",
    }

    // Validate policy type
    if (!formData.policy_type.trim()) {
      newErrors.policy_type = "Policy type is required"
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

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm() && client) {
      onSave(client.id, {
        ...formData,
        premium_paid: Number(formData.premium_paid),
      })
    }
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
            <Input
              id="premium_paid"
              name="premium_paid"
              type="number"
              min="0"
              step="0.01"
              value={formData.premium_paid}
              onChange={handleChange}
              className={errors.premium_paid ? "border-red-500" : ""}
              disabled={isSubmitting}
            />
            {errors.premium_paid && <p className="text-sm text-red-500">{errors.premium_paid}</p>}
          </div>

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
