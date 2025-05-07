import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export const metadata: Metadata = {
  title: "Policies | AgencyApp CRM",
  description: "Manage your insurance policies",
}

export default function PoliciesPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Policies</h1>
          <p className="text-muted-foreground">Manage your insurance policies and commissions</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/policies/add">
            <Plus className="mr-2 h-4 w-4" />
            Add New Policy
          </Link>
        </Button>
      </div>

      <div className="border rounded-lg p-8 text-center">
        <h3 className="text-lg font-medium mb-2">Policy Management</h3>
        <p className="text-muted-foreground mb-4">
          This is where you'll see all your policies. Add your first policy to get started.
        </p>
        <Button asChild>
          <Link href="/dashboard/policies/add">
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Policy
          </Link>
        </Button>
      </div>
    </div>
  )
}
