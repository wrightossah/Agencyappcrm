"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

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
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-4">
      <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
      <h2 className="text-xl font-semibold mb-2">Something went wrong!</h2>
      <p className="text-muted-foreground mb-6">There was an error loading the clients page. Please try again.</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
