import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileQuestion } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-4">
      <FileQuestion className="h-10 w-10 text-muted-foreground mb-4" />
      <h2 className="text-xl font-semibold mb-2">Page Not Found</h2>
      <p className="text-muted-foreground mb-6">The clients page you're looking for doesn't exist or has been moved.</p>
      <Button asChild>
        <Link href="/dashboard">Return to Dashboard</Link>
      </Button>
    </div>
  )
}
