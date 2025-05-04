"use client"

import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { useEffect, useState } from "react"

export function MobileSidebarToggle() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  const toggleSidebar = () => {
    const sidebar = document.getElementById("sidebar")
    sidebar?.classList.toggle("active")
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className="mobile-sidebar-toggle md:hidden"
      onClick={toggleSidebar}
      aria-label="Toggle sidebar"
    >
      <Menu className="h-5 w-5" />
    </Button>
  )
}
