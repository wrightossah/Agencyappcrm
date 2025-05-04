import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { AuthGuard } from "@/components/auth-guard"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content area */}
        <div className="flex-1 transition-all duration-300 md:ml-64">
          {/* Main content with padding - added more top padding */}
          <main className="p-4 pt-12 md:p-8 md:pt-12">
            {/* Page content */}
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
