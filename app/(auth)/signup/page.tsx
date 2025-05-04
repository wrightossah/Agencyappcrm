"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signUp } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Eye, EyeOff, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

export default function SignUpPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [company, setCompany] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
    phoneNumber: "",
  })
  const router = useRouter()
  const { toast } = useToast()

  const validateForm = () => {
    let isValid = true
    const newErrors = {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      company: "",
      phoneNumber: "",
    }

    // Validate full name
    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required"
      isValid = false
    }

    // Validate email
    if (!email.trim()) {
      newErrors.email = "Email is required"
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address"
      isValid = false
    }

    // Validate password
    if (!password) {
      newErrors.password = "Password is required"
      isValid = false
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
      isValid = false
    }

    // Validate confirm password
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match"
      isValid = false
    }

    // Validate company
    if (!company.trim()) {
      newErrors.company = "Insurance company is required"
      isValid = false
    }

    // Validate phone number (9 digits for Ghana numbers)
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required"
      isValid = false
    } else if (!/^\d{9}$/.test(phoneNumber.trim())) {
      newErrors.phoneNumber = "Please enter a valid 9-digit Ghanaian phone number"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    // Remove any non-digit characters
    const digitsOnly = value.replace(/\D/g, "")

    // If it starts with 0, remove it
    const normalizedNumber = digitsOnly.startsWith("0") ? digitsOnly.substring(1) : digitsOnly

    setPhoneNumber(normalizedNumber)

    // Clear error
    if (errors.phoneNumber) {
      setErrors((prev) => ({ ...prev, phoneNumber: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Format phone number with Ghana country code
      const formattedPhoneNumber = `+233${phoneNumber}`

      // Sign up the user
      const { user } = await signUp(email, password)

      if (user && user.id) {
        // Create or update profile with full name, company and phone number
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: user.id,
          full_name: fullName,
          first_name: fullName.split(" ")[0], // Extract first name
          last_name: fullName.split(" ").slice(1).join(" "), // Extract last name
          company: company,
          phone: formattedPhoneNumber,
          updated_at: new Date().toISOString(),
        })

        if (profileError) {
          console.error("Error updating profile:", profileError)
          // Continue even if profile update fails
        }
      }

      toast({
        title: "Account created",
        description: "Please check your email to confirm your account.",
      })
      router.push("/login")
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message || "There was a problem creating your account.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Agencyapp</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
          <CardDescription className="text-center">Enter your details to create your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name field - added as the first field */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={errors.fullName ? "border-red-500" : ""}
                required
              />
              {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? "border-red-500" : ""}
                required
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Insurance Company</Label>
              <Input
                id="company"
                type="text"
                placeholder="Your insurance company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className={errors.company ? "border-red-500" : ""}
                required
              />
              {errors.company && <p className="text-sm text-red-500">{errors.company}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">+233</div>
                <Input
                  id="phone_number"
                  type="tel"
                  placeholder="202123456"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  className={`pl-12 ${errors.phoneNumber ? "border-red-500" : ""}`}
                  required
                />
              </div>
              {errors.phoneNumber && <p className="text-sm text-red-500">{errors.phoneNumber}</p>}
              <p className="text-xs text-muted-foreground">Enter 9 digits without the leading zero</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={errors.password ? "border-red-500" : ""}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                </Button>
              </div>
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={errors.confirmPassword ? "border-red-500" : ""}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="sr-only">{showConfirmPassword ? "Hide password" : "Show password"}</span>
                </Button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
