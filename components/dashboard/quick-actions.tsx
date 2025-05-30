import { BarChart3, Settings, UserPlus, FileText, CreditCard } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const quickActions = [
  {
    title: "Add New Client",
    description: "Register a new client",
    icon: UserPlus,
    href: "/dashboard/clients/add",
    color: "primary" as const,
  },
  {
    title: "Reports",
    description: "View detailed reports",
    icon: FileText,
    href: "/dashboard/reports",
    color: "secondary" as const,
  },
  {
    title: "Analytics",
    description: "Performance insights",
    icon: BarChart3,
    href: "/dashboard/analytics",
    color: "warning" as const,
  },
  {
    title: "Subscription",
    description: "Manage your subscription",
    icon: CreditCard,
    href: "/dashboard/subscription",
    color: "success" as const,
  },
  {
    title: "Settings",
    description: "Manage your account",
    icon: Settings,
    href: "/dashboard/settings",
    color: "secondary" as const,
  },
]

interface QuickActionProps {
  title: string
  description: string
  icon: any
  href: string
  color: "primary" | "secondary" | "success" | "warning" | "destructive"
}

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {quickActions.map((action: QuickActionProps) => (
          <a key={action.title} href={action.href} className="block">
            <Card className="h-full transition-all duration-200 hover:shadow-md hover:scale-105 cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <action.icon className="h-5 w-5" />
                  {action.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </CardContent>
            </Card>
          </a>
        ))}
      </CardContent>
    </Card>
  )
}
