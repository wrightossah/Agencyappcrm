import type { Metadata } from "next"
import AddPolicyForm from "../add-policy-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Add Policy | AgencyApp CRM",
  description: "Add a new insurance policy",
}

export default function AddPolicyPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" asChild className="mr-4">
          <Link href="/dashboard/policies">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Policies
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Policy</h1>
          <p className="text-muted-foreground">Create a new insurance policy for your clients</p>
        </div>
      </div>

      <AddPolicyForm />
    </div>
  )
}
