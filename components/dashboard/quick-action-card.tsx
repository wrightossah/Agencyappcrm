"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import Link from "next/link"

interface QuickActionCardProps {
  title: string
  description: string
  icon: LucideIcon
  href: string
  color?: "primary" | "secondary" | "success" | "warning" | "danger"
}

export function QuickActionCard({ title, description, icon: Icon, href, color = "primary" }: QuickActionCardProps) {
  const colorClasses = {
    primary: "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200",
    secondary: "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200",
    success: "bg-green-50 hover:bg-green-100 text-green-700 border-green-200",
    warning: "bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200",
    danger: "bg-red-50 hover:bg-red-100 text-red-700 border-red-200",
  }

  return (
    <Link href={href}>
      <Card
        className={`hover:shadow-md hover:scale-[1.02] transition-all duration-300 cursor-pointer border ${colorClasses[color]}`}
      >
        <CardContent className="p-6 text-center">
          <div className="space-y-3">
            <div className="mx-auto w-12 h-12 rounded-lg bg-white/50 flex items-center justify-center">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{title}</h3>
              <p className="text-xs opacity-80 mt-1">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
