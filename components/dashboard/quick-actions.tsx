import { BarChart3, Mail, MessageSquare, Settings, UserPlus } from "lucide-react"

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
    title: "Send Email Reminder",
    description: "Email policy reminders",
    icon: Mail,
    href: "/dashboard/clients",
    color: "secondary" as const,
  },
  {
    title: "Send SMS Reminder",
    description: "SMS policy reminders",
    icon: MessageSquare,
    href: "/dashboard/clients",
    color: "success" as const,
  },
  {
    title: "Go to Analytics",
    description: "View detailed reports",
    icon: BarChart3,
    href: "/dashboard/analytics",
    color: "warning" as const,
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
          <a key={action.title} href={action.href}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {<action.icon className="h-4 w-4" />}
                  {action.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </CardContent>
            </Card>
          </a>
        ))}
      </CardContent>
    </Card>
  )
}
