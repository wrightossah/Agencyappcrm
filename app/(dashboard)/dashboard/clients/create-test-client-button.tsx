"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"
import { createClient, ensureAgentsTable, addCurrentUserAsAgent } from "./actions"
import { useToast } from "@/hooks/use-toast"

export default function CreateTestClientButton() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleCreateClient = async () => {
    setIsLoading(true)
    try {
      // Step 1: Ensure the agents table exists
      const tableResult = await ensureAgentsTable()
      if (!tableResult.success) {
        throw new Error(tableResult.error || "Failed to ensure agents table exists")
      }

      // Step 2: Add the current user as an agent if not already
      const agentResult = await addCurrentUserAsAgent()
      if (!agentResult.success) {
        throw new Error(agentResult.error || "Failed to add user as agent")
      }

      // Step 3: Create the client
      const result = await createClient()

      if (result.success) {
        toast({
          title: "Client Created",
          description: "John Doe has been added successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create client",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleCreateClient} disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating...
        </>
      ) : (
        <>
          <Plus className="mr-2 h-4 w-4" />
          Create Test Client
        </>
      )}
    </Button>
  )
}
