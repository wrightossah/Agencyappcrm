import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Check, Shield, BarChart3, Users, Mail, Phone, Globe } from "lucide-react"

export default function HomePage() {
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

      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Manage Your Insurance Business with Ease
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Agencyapp helps insurance agents streamline client management, track policies, and grow their
                  business.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg" className="px-8">
                  <Link href="/signup">
                    Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/login">Log In</Link>
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative h-[350px] w-full overflow-hidden rounded-xl bg-muted/50 p-4 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-muted/20" />
                <div className="relative grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2 rounded-lg bg-background p-4 shadow">
                    <Users className="h-6 w-6 text-primary" />
                    <h3 className="text-lg font-bold">Client Management</h3>
                    <p className="text-sm text-muted-foreground">
                      Organize and track all your client information in one place.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 rounded-lg bg-background p-4 shadow">
                    <BarChart3 className="h-6 w-6 text-primary" />
                    <h3 className="text-lg font-bold">Analytics</h3>
                    <p className="text-sm text-muted-foreground">
                      Gain insights into your business performance with detailed reports.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 rounded-lg bg-background p-4 shadow">
                    <Shield className="h-6 w-6 text-primary" />
                    <h3 className="text-lg font-bold">Policy Tracking</h3>
                    <p className="text-sm text-muted-foreground">
                      Keep track of all policies and renewals automatically.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 rounded-lg bg-background p-4 shadow">
                    <Check className="h-6 w-6 text-primary" />
                    <h3 className="text-lg font-bold">Task Management</h3>
                    <p className="text-sm text-muted-foreground">
                      Never miss a follow-up with integrated task management.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Features</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl">
                Everything you need to manage your insurance business efficiently
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 sm:grid-cols-2 md:grid-cols-3">
            <div className="flex flex-col items-center space-y-2 rounded-lg p-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Client Management</h3>
              <p className="text-center text-muted-foreground">
                Store and manage all your client information in one secure place.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg p-4">
              <div className="rounded-full bg-primary/10 p-3">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Analytics & Reporting</h3>
              <p className="text-center text-muted-foreground">
                Get insights into your business with detailed analytics and reports.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg p-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Policy Management</h3>
              <p className="text-center text-muted-foreground">
                Track policies, renewals, and claims in a centralized system.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - Updated with new pricing details */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Pricing</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl">
                Affordable plans for insurance professionals
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 sm:grid-cols-2 md:grid-cols-3">
            <div className="flex flex-col rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex flex-col space-y-2">
                <h3 className="text-2xl font-bold">Free Trial</h3>
                <p className="text-muted-foreground">Try all features for 14 days</p>
                <div className="flex">
                  <span className="text-3xl font-bold">Ghc 0</span>
                </div>
              </div>
              <ul className="my-6 space-y-2">
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>Full access to all features</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>Up to 10 clients</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>Basic analytics</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>14 days trial period</span>
                </li>
              </ul>
              <Button asChild size="lg" variant="outline">
                <Link href="/signup">Start Free Trial</Link>
              </Button>
            </div>

            <div className="flex flex-col rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex flex-col space-y-2">
                <h3 className="text-2xl font-bold">Basic Plan</h3>
                <p className="text-muted-foreground">Monthly subscription</p>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">Ghc 10</span>
                  <span className="ml-1 text-muted-foreground">/month</span>
                </div>
              </div>
              <ul className="my-6 space-y-2">
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>Unlimited clients</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>Policy tracking</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>Email notifications</span>
                </li>
              </ul>
              <Button asChild size="lg">
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>

            <div className="flex flex-col rounded-lg border bg-card p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium">
                Best Value
              </div>
              <div className="flex flex-col space-y-2">
                <h3 className="text-2xl font-bold">Annual Plan</h3>
                <p className="text-muted-foreground">Save Ghc 20</p>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">Ghc 100</span>
                  <span className="ml-1 text-muted-foreground">/year</span>
                </div>
                <p className="text-sm text-green-600">
                  <s className="text-muted-foreground">Ghc 120</s> Save Ghc 20
                </p>
              </div>
              <ul className="my-6 space-y-2">
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>Everything in Basic plan</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>SMS notifications</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>Advanced reporting</span>
                </li>
              </ul>
              <Button asChild size="lg">
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          </div>

          {/* 2-Year Plan */}
          <div className="mx-auto max-w-5xl mt-6">
            <div className="flex flex-col rounded-lg border bg-card p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium">
                Maximum Savings
              </div>
              <div className="flex flex-col space-y-2">
                <h3 className="text-2xl font-bold">2-Year Plan</h3>
                <p className="text-muted-foreground">Save Ghc 40</p>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">Ghc 200</span>
                  <span className="ml-1 text-muted-foreground">/2 years</span>
                </div>
                <p className="text-sm text-green-600">
                  <s className="text-muted-foreground">Ghc 240</s> Save Ghc 40
                </p>
              </div>
              <ul className="my-6 space-y-2 md:grid md:grid-cols-2 md:gap-4">
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>Everything in Annual plan</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>Dedicated account manager</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>Custom branding options</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>Price lock guarantee</span>
                </li>
              </ul>
              <Button asChild size="lg">
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50" id="contact">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Contact Us</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl">
                Have questions? We're here to help you get started with Agencyapp
              </p>
            </div>
          </div>

          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-12 md:grid-cols-2">
            {/* Contact Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold">Get in Touch</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <span>0244014207</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <span>agencyappcrm@gmail.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Globe className="h-5 w-5 text-primary" />
                  <span>www.agencyapp.site</span>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h4 className="font-medium mb-2">Office Hours</h4>
                <p className="text-sm text-muted-foreground">Monday - Friday: 9:00 AM - 5:00 PM</p>
                <p className="text-sm text-muted-foreground">Saturday: 10:00 AM - 2:00 PM</p>
                <p className="text-sm text-muted-foreground">Sunday: Closed</p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-xl font-bold mb-4">Send us a Message</h3>
              <form action="https://formsubmit.co/agencyappcrm@gmail.com" method="POST" className="space-y-4">
                <input type="hidden" name="_subject" value="New contact from Agencyapp website" />
                <input type="hidden" name="_captcha" value="false" />
                <input type="hidden" name="_next" value="https://agencyapp.site/thank-you" />

                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Your name"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={4}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>

                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container px-4 py-12 md:px-6 md:py-16">
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">Agencyapp</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Streamline your insurance business with our comprehensive CRM solution.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                  <span className="sr-only">Facebook</span>
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                  <span className="sr-only">Twitter</span>
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                  </svg>
                  <span className="sr-only">Instagram</span>
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium uppercase tracking-wider">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#contact" className="text-muted-foreground hover:text-foreground">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium uppercase tracking-wider">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Tutorials
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    API Reference
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium uppercase tracking-wider">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    GDPR Compliance
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Agencyapp. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
