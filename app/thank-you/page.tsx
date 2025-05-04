import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, CheckCircle } from "lucide-react"

export default function ThankYouPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Agencyapp</span>
          </div>
          <nav className="flex gap-4 sm:gap-6">
            <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4">
              Log In
            </Link>
            <Button asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Thank You Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Thank You!</h1>
          <p className="text-muted-foreground">
            Your message has been received. We'll get back to you as soon as possible.
          </p>
          <div className="pt-4">
            <Button asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50 py-6">
        <div className="container px-4 md:px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold">Agencyapp</span>
          </div>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Agencyapp. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
