import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SMSSettings } from "./sms-settings"

const SettingsPage = () => {
  return (
    <div className="container mx-auto py-10">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Settings</h2>
          <p className="text-muted-foreground">Manage your account settings and preferences.</p>
        </div>
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="sms">SMS</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          <TabsContent value="profile" className="space-y-4">
            Profile settings content
          </TabsContent>
          <TabsContent value="account" className="space-y-4">
            Account settings content
          </TabsContent>
          <TabsContent value="sms" className="space-y-4">
            <SMSSettings />
          </TabsContent>
          <TabsContent value="notifications" className="space-y-4">
            Notifications settings content
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default SettingsPage
