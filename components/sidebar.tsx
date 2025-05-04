"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth-provider"
import {
  FiUsers,
  FiFileText,
  FiBarChart2,
  FiCreditCard,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiShield,
} from "react-icons/fi"

type NavItem = {
  title: string
  href: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  {
    title: "Clients",
    href: "/dashboard/clients",
    icon: FiUsers,
  },
  {
    title: "Reports",
    href: "/dashboard/reports",
    icon: FiFileText,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: FiBarChart2,
  },
  {
    title: "Subscription",
    href: "/dashboard/subscription",
    icon: FiCreditCard,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: FiSettings,
  },
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { signOut } = useAuth()

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (isOpen && window.innerWidth < 768) {
        const sidebar = document.getElementById("sidebar")
        const toggleButton = document.getElementById("sidebar-toggle")

        if (
          sidebar &&
          toggleButton &&
          !sidebar.contains(e.target as Node) &&
          !toggleButton.contains(e.target as Node)
        ) {
          setIsOpen(false)
        }
      }
    }

    document.addEventListener("mousedown", handleOutsideClick)
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
    }
  }, [isOpen])

  // Prevent body scrolling when sidebar is open on mobile
  useEffect(() => {
    if (isOpen && window.innerWidth < 768) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsOpen(false)
    }
  }, [pathname])

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Toggle button - updated positioning */}
      <button
        id="sidebar-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-2 left-2 z-50 p-2 rounded-md bg-white shadow-md border border-gray-200 md:hidden transition-all duration-300 hover:bg-gray-100"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <FiX className="h-6 w-6 text-gray-700" /> : <FiMenu className="h-6 w-6 text-gray-700" />}
      </button>

      {/* Sidebar */}
      <aside
        id="sidebar"
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 shadow-xl z-40 transition-all duration-300 ease-in-out transform",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0", // Always visible on desktop
        )}
      >
        {/* Close button - visible only on mobile */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-md text-gray-500 hover:bg-gray-100 md:hidden"
          aria-label="Close sidebar"
        >
          <FiX className="h-5 w-5" />
        </button>

        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <FiShield className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">Agencyapp</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem-3.5rem)]">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname === "/dashboard"
                ? "bg-gray-100 text-primary"
                : "text-gray-700 hover:bg-gray-100 hover:text-primary",
            )}
          >
            <FiBarChart2
              className={cn("h-5 w-5 transition-colors", pathname === "/dashboard" ? "text-primary" : "text-gray-500")}
            />
            <span>Dashboard</span>
          </Link>

          {navItems.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === item.href || pathname.startsWith(`${item.href}/`)
                  ? "bg-gray-100 text-primary"
                  : "text-gray-700 hover:bg-gray-100 hover:text-primary",
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  pathname === item.href || pathname.startsWith(`${item.href}/`) ? "text-primary" : "text-gray-500",
                )}
              />
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>

        {/* Logout button */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <button
            onClick={signOut}
            className="flex items-center space-x-3 w-full px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors"
          >
            <FiLogOut className="h-5 w-5 text-gray-500" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
