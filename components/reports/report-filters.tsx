"use client"

import { useState } from "react"
import { Calendar, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import type { ReportType, TimeFrame } from "@/lib/types"

interface ReportFiltersProps {
  reportType: ReportType
  timeFrame: TimeFrame
  dateRange: { from: Date | undefined; to: Date | undefined }
  onReportTypeChange: (type: ReportType) => void
  onTimeFrameChange: (frame: TimeFrame) => void
  onDateRangeChange: (range: { from: Date | undefined; to: Date | undefined }) => void
  onExportPDF: () => void
  onExportCSV: () => void
}

export function ReportFilters({
  reportType,
  timeFrame,
  dateRange,
  onReportTypeChange,
  onTimeFrameChange,
  onDateRangeChange,
  onExportPDF,
  onExportCSV,
}: ReportFiltersProps) {
  const [date, setDate] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: dateRange.from,
    to: dateRange.to,
  })

  const reportTypes = [
    { value: "policy-summary", label: "Policy Summary" },
    { value: "client-acquisition", label: "Client Acquisition" },
    { value: "revenue-analysis", label: "Revenue Analysis" },
    { value: "claims-report", label: "Claims Report" },
  ]

  const timeFrames = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
  ]

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="grid gap-2">
              <label htmlFor="report-type" className="text-sm font-medium">
                Report Type
              </label>
              <Select value={reportType} onValueChange={(value) => onReportTypeChange(value as ReportType)}>
                <SelectTrigger id="report-type" className="w-full md:w-[180px]">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="time-frame" className="text-sm font-medium">
                Time Frame
              </label>
              <Select value={timeFrame} onValueChange={(value) => onTimeFrameChange(value as TimeFrame)}>
                <SelectTrigger id="time-frame" className="w-full md:w-[180px]">
                  <SelectValue placeholder="Select time frame" />
                </SelectTrigger>
                <SelectContent>
                  {timeFrames.map((frame) => (
                    <SelectItem key={frame.value} value={frame.value}>
                      {frame.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="date-range" className="text-sm font-medium">
                Date Range
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date-range"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal md:w-[300px]",
                      !date.from && "text-muted-foreground",
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {date.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "PPP")} - {format(date.to, "PPP")}
                        </>
                      ) : (
                        format(date.from, "PPP")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    initialFocus
                    mode="range"
                    defaultMonth={date.from}
                    selected={date}
                    onSelect={(selectedDate) => {
                      setDate(selectedDate)
                      onDateRangeChange(selectedDate)
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Export <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onExportPDF}>Export as PDF</DropdownMenuItem>
                <DropdownMenuItem onClick={onExportCSV}>Export as CSV</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
