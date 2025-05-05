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
import { Loader2 } from "lucide-react"

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

interface ClaimFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (clientId: string, claim: any) => void
  client: Client | null
  isSubmitting: boolean
}

// Claim types for dropdown
const claimTypes = [
  "Motor Accident",
  "Fire Damage",
  "Theft",
  "Property Damage",
  "Medical",
  "Travel",
  "Liability",
  "Other",
]

export default function ClaimForm({ isOpen, onClose, onSave, client, isSubmitting }: ClaimFormProps) {
  const [formData, setFormData] = useState({
    claim_type: "",
    claim_date: "",
    location: "",
    description: "",
    amount: "",
  })

  const [errors, setErrors] = useState({
    claim_type: "",
    claim_date: "",
    location: "",
    description: "",
    amount: "",
  })

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // Set today's date as default for claim date
      const today = new Date().toISOString().split("T")[0]

      setFormData({
        claim_type: "",
        claim_date: today,
        location: "",
        description: "",
        amount: "",
      })
    }

    // Clear errors
    setErrors({
      claim_type: "",
      claim_date: "",
      location: "",
      description: "",
      amount: "",
    })
  }, [isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error for this field
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, claim_type: value }))

    // Clear error
    if (errors.claim_type) {
      setErrors((prev) => ({ ...prev, claim_type: "" }))
    }
  }

  const validateForm = () => {
    let isValid = true
    const newErrors = {
      claim_type: "",
      claim_date: "",
      location: "",
      description: "",
      amount: "",
    }

    // Validate claim type
    if (!formData.claim_type.trim()) {
      newErrors.claim_type = "Claim type is required"
      isValid = false
    }

    // Validate claim date
    if (!formData.claim_date) {
      newErrors.claim_date = "Claim date is required"
      isValid = false
    }

    // Validate location
    if (!formData.location.trim()) {
      newErrors.location = "Location is required"
      isValid = false
    }

    // Validate description
    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
      isValid = false
    }

    // Validate amount
    if (!formData.amount) {
      newErrors.amount = "Amount is required"
      isValid = false
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount"
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
        amount: Number(formData.amount),
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Claim</DialogTitle>
          <DialogDescription>{client ? `Add a new claim for ${client.name}` : "Add a new claim"}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="claim_type">Type of Claim</Label>
            <Select value={formData.claim_type} onValueChange={handleSelectChange}>
              <SelectTrigger id="claim_type" className={errors.claim_type ? "border-red-500" : ""}>
                <SelectValue placeholder="Select claim type" />
              </SelectTrigger>
              <SelectContent>
                {claimTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.claim_type && <p className="text-sm text-red-500">{errors.claim_type}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="claim_date">Date of Claim</Label>
            <Input
              id="claim_date"
              name="claim_date"
              type="date"
              value={formData.claim_date}
              onChange={handleChange}
              className={errors.claim_date ? "border-red-500" : ""}
              disabled={isSubmitting}
            />
            {errors.claim_date && <p className="text-sm text-red-500">{errors.claim_date}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={errors.location ? "border-red-500" : ""}
              placeholder="Where did the incident occur?"
              disabled={isSubmitting}
            />
            {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={errors.description ? "border-red-500" : ""}
              placeholder="Provide details about the claim"
              rows={4}
              disabled={isSubmitting}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount Involved (GHC)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={handleChange}
              className={errors.amount ? "border-red-500" : ""}
              placeholder="0.00"
              disabled={isSubmitting}
            />
            {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Claim"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
