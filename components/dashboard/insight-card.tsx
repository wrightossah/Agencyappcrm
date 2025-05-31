"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { LucideIcon } from "lucide-react"
import Link from "next/link"

interface InsightCardProps {
  title: string
  value: string | number
  description: string
  icon: LucideIcon
  href?: string | null
  clickable?: boolean
  loading?: boolean
}

export function InsightCard({
  title,
  value,
  description,
  icon: Icon,
  href,
  clickable = true,
  loading = false,
}: InsightCardProps) {
  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (clickable && href) {
      return (
        <Link href={href} className="block">
          <Card className="transition-all duration-200 hover:shadow-md hover:scale-105 cursor-pointer">{children}</Card>
        </Link>
      )
    }

    return <Card className={clickable ? "cursor-pointer" : ""}>{children}</Card>
  }

  return (
    <CardWrapper>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-[100px]" />
            <Skeleton className="h-4 w-[140px]" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </>
        )}
      </CardContent>
    </CardWrapper>
  )
}
