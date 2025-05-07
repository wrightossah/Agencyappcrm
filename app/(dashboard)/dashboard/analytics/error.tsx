"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, RefreshCw } from "lucide-react"

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
    <div className="flex items-center justify-center min-h-[600px]">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>Something went wrong!</CardTitle>
          </div>
          <CardDescription>There was an error loading the analytics data.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground border p-3 rounded-md bg-muted/50">
            {error.message || "An unexpected error occurred."}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={reset} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
