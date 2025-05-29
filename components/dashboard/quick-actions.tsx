"use client"

import { QuickActionCard } from "./quick-action-card"
import { UserPlus, Mail, MessageSquare, Upload, BarChart3, Settings } from "lucide-react"

export function QuickActions() {
  const quickActions = [
    {
      title: "Add New Client",
      description: "Register a new client",
      icon: UserPlus,
      href: "/dashboard/clients?action=add",
      color: "success" as const,
    },
    {
      title: "Send Email Reminder",
      description: "Email policy reminders",
      icon: Mail,
      href: "/dashboard/clients",
      color: "primary" as const,
    },
    {
      title: "Send SMS Reminder",
      description: "SMS policy reminders",
      icon: MessageSquare,
      href: "/dashboard/clients",
      color: "warning" as const,
    },
    {
      title: "Upload Document",
      description: "Add client documents",
      icon: Upload,
      href: "/dashboard/clients",
      color: "secondary" as const,
    },
    {
      title: "Go to Analytics",
      description: "View detailed reports",
      icon: BarChart3,
      href: "/dashboard/analytics",
      color: "primary" as const,
    },
    {
      title: "Settings",
      description: "Configure your account",
      icon: Settings,
      href: "/dashboard/settings",
      color: "secondary" as const,
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {quickActions.map((action, index) => (
        <QuickActionCard
          key={index}
          title={action.title}
          description={action.description}
          icon={action.icon}
          href={action.href}
          color={action.color}
        />
      ))}
    </div>
  )
}
