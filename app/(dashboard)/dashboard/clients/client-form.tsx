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

interface ClientFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (client: any) => void
  client: Client | null
  isEditing: boolean
  isSubmitting: boolean
}

export default function ClientForm({ isOpen, onClose, onSave, client, isEditing, isSubmitting }: ClientFormProps) {
  // Update the formData state to include both phone and phone_number
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    address: "",
    phone_number: "", // We'll use this for both phone and phone_number
    email: "",
  })

  // Update the errors state
  const [errors, setErrors] = useState({
    name: "",
    address: "",
    phone_number: "",
    email: "",
  })

  // Update the useEffect to set phone_number from either phone or phone_number
  // and strip the country code if present
  useEffect(() => {
    if (isOpen && client) {
      // Get the phone number and remove country code if present
      let phoneNumber = client.phone_number || client.phone || ""

      // If phone number starts with +233, remove it
      if (phoneNumber.startsWith("+233")) {
        phoneNumber = phoneNumber.substring(4)
      }
      // If phone number starts with 0, remove it
      else if (phoneNumber.startsWith("0")) {
        phoneNumber = phoneNumber.substring(1)
      }

      setFormData({
        id: client.id,
        name: client.name,
        address: client.address,
        phone_number: phoneNumber, // Store without country code
        email: client.email,
      })
    } else if (isOpen) {
      // Reset form for new client
      setFormData({
        id: "",
        name: "",
        address: "",
        phone_number: "",
        email: "",
      })
    }

    // Clear errors
    setErrors({
      name: "",
      address: "",
      phone_number: "",
      email: "",
    })
  }, [isOpen, client])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    // Special handling for phone number to ensure only digits
    if (name === "phone_number") {
      // Remove any non-digit characters
      const digitsOnly = value.replace(/\D/g, "")

      // If it starts with 0, remove it
      const normalizedNumber = digitsOnly.startsWith("0") ? digitsOnly.substring(1) : digitsOnly

      // Update the form with normalized number
      setFormData((prev) => ({ ...prev, [name]: normalizedNumber }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }

    // Clear error for this field
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  // Update the validateForm function for 9-digit Ghana numbers
  const validateForm = () => {
    let isValid = true
    const newErrors = {
      name: "",
      address: "",
      phone_number: "",
      email: "",
    }

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
      isValid = false
    }

    // Validate address
    if (!formData.address.trim()) {
      newErrors.address = "Address is required"
      isValid = false
    }

    // Validate phone_number (9 digits for Ghana numbers without country code)
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = "Phone number is required"
      isValid = false
    } else if (!/^\d{9}$/.test(formData.phone_number.trim())) {
      newErrors.phone_number = "Please enter a valid 9-digit Ghanaian phone number (e.g., 202123456)"
      isValid = false
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      // Add the +233 prefix to the phone number before saving
      const formattedPhoneNumber = `+233${formData.phone_number}`

      onSave({
        ...formData,
        phone_number: formattedPhoneNumber,
      })
    }
  }

  // Format the display of the phone number with country code
  const getPhoneDisplay = () => {
    if (!formData.phone_number) return ""
    return `+233 ${formData.phone_number}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Client" : "Add New Client"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the client's information below."
              : "Enter the client's details to add them to your client list."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? "border-red-500" : ""}
              disabled={isSubmitting}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={errors.address ? "border-red-500" : ""}
              disabled={isSubmitting}
            />
            {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone_number">Phone Number</Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">+233</div>
              <Input
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="202123456"
                className={`pl-12 ${errors.phone_number ? "border-red-500" : ""}`}
                disabled={isSubmitting}
              />
            </div>
            {errors.phone_number && <p className="text-sm text-red-500">{errors.phone_number}</p>}
            <p className="text-xs text-muted-foreground">Enter 9 digits without the leading zero</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "border-red-500" : ""}
              disabled={isSubmitting}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Saving..." : "Adding..."}
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Save Client"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
