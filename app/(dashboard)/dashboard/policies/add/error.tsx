"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

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

      <Card className="w-full max-w-3xl mx-auto border-red-200 bg-red-50 dark:bg-red-950/10">
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertCircle className="mr-2 h-5 w-5" />
            Something went wrong
          </CardTitle>
          <CardDescription>There was an error loading the policy form.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-4">Error: {error.message || "Unknown error occurred"}</div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-4">
          <Button variant="outline" asChild>
            <Link href="/dashboard/policies">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Policies
            </Link>
          </Button>
          <Button onClick={reset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
