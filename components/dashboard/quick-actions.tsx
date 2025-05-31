import { BarChart3, CreditCard } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const quickActions = [
  {
    title: "View Reports",
    description: "Access detailed analytics",
    icon: BarChart3,
    href: "/dashboard/analytics",
    color: "primary" as const,
  },
  {
    title: "Subscription",
    description: "Manage your plan",
    icon: CreditCard,
    href: "/dashboard/subscription",
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
      <CardContent className="grid gap-4 md:grid-cols-2">
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
