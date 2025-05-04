import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <Skeleton className="h-10 w-full" />

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="space-y-2">
                  <div className="flex items-start">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-full ml-2" />
                  </div>
                  <div className="flex items-center">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-32 ml-2" />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-24 ml-auto" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
