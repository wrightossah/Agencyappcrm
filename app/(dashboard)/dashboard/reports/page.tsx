import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">View and download your insurance reports</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Policy Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Summary of all policies issued and renewed in the current month
            </p>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm">Last updated: April 5, 2025</p>
              </div>
              <Button size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Client Acquisition Report</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Analysis of new client acquisition and conversion rates
            </p>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm">Last updated: April 3, 2025</p>
              </div>
              <Button size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Detailed breakdown of revenue by policy type and client segment
            </p>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm">Last updated: April 1, 2025</p>
              </div>
              <Button size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Claims Report</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Summary of all claims filed and processed in the current quarter
            </p>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm">Last updated: March 28, 2025</p>
              </div>
              <Button size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
