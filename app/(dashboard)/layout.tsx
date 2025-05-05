import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { AuthGuard } from "@/components/auth-guard"
import { BackButton } from "@/components/back-button"

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
          {/* Back button */}
          <div className="p-4 pt-6 md:px-8">
            <BackButton />
          </div>

          {/* Main content with padding */}
          <main className="p-4 md:p-8">
            {/* Page content */}
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
