import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ExampleContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your Agencyapp dashboard</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Clients</CardTitle>
            <CardDescription>Your client base</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Active Policies</CardTitle>
            <CardDescription>Current policies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">36</div>
            <p className="text-xs text-muted-foreground">+4 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Revenue</CardTitle>
            <CardDescription>Monthly earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Ghc 12,234</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest client interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-2 rounded-lg bg-gray-50">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <div>
                  <p className="text-sm font-medium">
                    {["Policy renewal for John Doe", "New client: Sarah Smith", "Quote sent to Michael Johnson"][i - 1]}
                  </p>
                  <p className="text-xs text-muted-foreground">{["2 hours ago", "Yesterday", "2 days ago"][i - 1]}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
