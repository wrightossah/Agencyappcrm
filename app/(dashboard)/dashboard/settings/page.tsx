"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Eye, EyeOff, Upload } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    avatarUrl: "",
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordError, setPasswordError] = useState("")
  const [updateSuccess, setUpdateSuccess] = useState(false)

  const { toast } = useToast()
  const { user } = useAuth()

  // Fetch user profile data
  useEffect(() => {
    if (user) {
      fetchUserProfile()
    }
  }, [user])

  const fetchUserProfile = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (error) {
        console.error("Error fetching profile:", error)
        // If no profile exists yet, we'll use email to pre-fill
        setUserData({
          firstName: user.email ? user.email.split("@")[0] : "",
          lastName: "",
          email: user.email || "",
          phone: "",
          company: "",
          avatarUrl: "",
        })
      } else if (data) {
        setUserData({
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          email: user.email || "",
          phone: data.phone || "",
          company: data.company || "",
          avatarUrl: data.avatar_url || "",
        })
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone,
        company: userData.company,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      setUpdateSuccess(true)
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved successfully.",
      })

      // Clear success message after 3 seconds
      setTimeout(() => setUpdateSuccess(false), 3000)
    } catch (error: any) {
      console.error("Error updating profile:", error)
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError("")

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords don't match")
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      })

      if (error) throw error

      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      })

      // Clear password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error: any) {
      console.error("Error updating password:", error)
      toast({
        title: "Password update failed",
        description: error.message || "Failed to update password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return
    if (!user) return

    const file = e.target.files[0]
    const fileExt = file.name.split(".").pop()
    const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `avatars/${fileName}`

    setUploadingAvatar(true)

    try {
      // Upload image to storage
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath)

      if (!data) throw new Error("Failed to get public URL")

      // Update profile with avatar URL
      const { error: updateError } = await supabase.from("profiles").upsert({
        id: user.id,
        avatar_url: data.publicUrl,
        updated_at: new Date().toISOString(),
      })

      if (updateError) throw updateError

      // Update local state
      setUserData({
        ...userData,
        avatarUrl: data.publicUrl,
      })

      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      })
    } catch (error: any) {
      console.error("Error uploading avatar:", error)
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload avatar. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploadingAvatar(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="flex flex-col items-center space-y-4 sm:items-start">
                  <Label htmlFor="avatar" className="text-center sm:text-left">
                    Profile Picture
                  </Label>
                  <div className="flex flex-col items-center gap-4 sm:flex-row">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={userData.avatarUrl} alt={userData.firstName} />
                      <AvatarFallback>
                        {userData.firstName.charAt(0)}
                        {userData.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-2">
                      <Button type="button" variant="outline" className="relative" disabled={uploadingAvatar}>
                        {uploadingAvatar ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload New Picture
                          </>
                        )}
                        <input
                          id="avatar"
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 cursor-pointer opacity-0"
                          onChange={handleAvatarUpload}
                          disabled={uploadingAvatar}
                        />
                      </Button>
                      <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max size 2MB.</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First name</Label>
                    <Input
                      id="first-name"
                      value={userData.firstName}
                      onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last name</Label>
                    <Input
                      id="last-name"
                      value={userData.lastName}
                      onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={userData.email} disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground">To change your email, please contact support.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={userData.phone}
                    onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                    placeholder="e.g., 0XXXXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={userData.company}
                    onChange={(e) => setUserData({ ...userData, company: e.target.value })}
                  />
                </div>

                {updateSuccess && (
                  <Alert className="bg-green-50 text-green-800 border-green-200">
                    <AlertDescription>Your profile has been updated successfully.</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save changes"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="sr-only">{showNewPassword ? "Hide password" : "Show password"}</span>
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
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
                  {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
                </div>
                <Button
                  type="submit"
                  disabled={
                    loading ||
                    !passwordData.currentPassword ||
                    !passwordData.newPassword ||
                    !passwordData.confirmPassword
                  }
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update password"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delete Account</CardTitle>
              <CardDescription>Permanently delete your account and all data</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Once you delete your account, there is no going back. All your data will be permanently removed.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="destructive">Delete Account</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive email notifications about account activity</p>
                </div>
                <Switch id="email-notifications" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive text messages for important updates</p>
                </div>
                <Switch id="sms-notifications" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="marketing-emails">Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">Receive promotional emails and offers</p>
                </div>
                <Switch id="marketing-emails" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
