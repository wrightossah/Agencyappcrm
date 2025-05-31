import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileSettings } from "@/components/settings/profile-settings"
import { PasswordSettings } from "@/components/settings/password-settings"

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-6 px-4 md:px-6 lg:px-8">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Settings</h2>
          <p className="text-muted-foreground">Manage your account settings and preferences.</p>
        </div>
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>
          <TabsContent value="profile" className="space-y-6">
            <ProfileSettings />
          </TabsContent>
          <TabsContent value="password" className="space-y-6">
            <PasswordSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
