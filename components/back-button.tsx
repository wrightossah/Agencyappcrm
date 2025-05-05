"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface BackButtonProps {
  className?: string
}

export function BackButton({ className }: BackButtonProps) {
  const router = useRouter()

  return (
    <Button variant="ghost" size="sm" className={className} onClick={() => router.back()} aria-label="Go back">
      <ArrowLeft className="mr-2 h-4 w-4" />
      Back
    </Button>
  )
}
