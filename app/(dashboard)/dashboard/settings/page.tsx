import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import EmailNativeTest from "@/components/email-native-test"

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Settings</h2>
          <p className="text-muted-foreground">Manage your account settings and set preferences.</p>
        </div>
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="communications">Communications</TabsTrigger>
            <TabsTrigger value="email">Email Test</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>
          <TabsContent value="profile" className="space-y-6">
            <div>Profile settings content</div>
          </TabsContent>
          <TabsContent value="communications" className="space-y-6">
            <div>Communications settings content</div>
          </TabsContent>
          <TabsContent value="email" className="space-y-6">
            <EmailNativeTest />
          </TabsContent>
          <TabsContent value="preferences" className="space-y-6">
            <div>Preferences settings content</div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
