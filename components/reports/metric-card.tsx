import { ArrowDown, ArrowUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { MetricCardProps } from "@/lib/types"

export function MetricCard({ title, value, description, trend, icon }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend !== undefined) && (
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            {trend !== undefined && (
              <span
                className={`mr-1 flex items-center ${trend > 0 ? "text-green-500" : trend < 0 ? "text-red-500" : ""}`}
              >
                {trend > 0 ? (
                  <ArrowUp className="h-3 w-3 mr-1" />
                ) : trend < 0 ? (
                  <ArrowDown className="h-3 w-3 mr-1" />
                ) : null}
                {Math.abs(trend)}%
              </span>
            )}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
