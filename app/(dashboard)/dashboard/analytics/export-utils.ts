import { jsPDF } from "jspdf"
import "jspdf-autotable"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"

// Export data to CSV
export function exportToCSV(data: any, dateRange?: DateRange | undefined) {
  // Format date range for filename
  const dateString = formatDateRangeForFilename(dateRange)

  // Create filename
  const filename = `analytics_export_${dateString}.csv`

  // Prepare CSV content
  let csvContent = "data:text/csv;charset=utf-8,"

  // Add Sales Performance
  csvContent += "SALES PERFORMANCE\n"
  csvContent += "Month,Sales,Revenue\n"

  data.salesData.forEach((item: any) => {
    csvContent += `${item.month},${item.sales},${item.revenue}\n`
  })

  csvContent += "\n"

  // Add Commission Breakdown
  csvContent += "COMMISSION BREAKDOWN\n"
  csvContent += "Policy Type,Premium,Commission\n"

  data.commissionData.forEach((item: any) => {
    csvContent += `${item.name},${item.premium},${item.commission}\n`
  })

  csvContent += "\n"

  // Add Policy Distribution
  csvContent += "POLICY DISTRIBUTION\n"
  csvContent += "Policy Type,Count\n"

  data.policyDistData.forEach((item: any) => {
    csvContent += `${item.name},${item.value}\n`
  })

  csvContent += "\n"

  // Add Client Activity
  csvContent += "CLIENT ACTIVITY\n"
  csvContent += "Status,Count\n"

  data.clientActivityData.forEach((item: any) => {
    csvContent += `${item.name},${item.value}\n`
  })

  // Create download link
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement("a")
  link.setAttribute("href", encodedUri)
  link.setAttribute("download", filename)
  document.body.appendChild(link)

  // Trigger download
  link.click()

  // Clean up
  document.body.removeChild(link)
}

// Export data to PDF
export function exportToPDF(data: any, dateRange?: DateRange | undefined) {
  // Create new PDF document
  const doc = new jsPDF()

  // Add title
  doc.setFontSize(18)
  doc.text("Analytics Report", 14, 22)

  // Add date range
  doc.setFontSize(12)
  if (dateRange?.from) {
    const from = format(dateRange.from, "MMM d, yyyy")
    const to = dateRange.to ? format(dateRange.to, "MMM d, yyyy") : "Present"
    doc.text(`Date Range: ${from} to ${to}`, 14, 30)
  } else {
    doc.text(`Date: ${format(new Date(), "MMM d, yyyy")}`, 14, 30)
  }

  let yPos = 40

  // Add Sales Performance table
  doc.setFontSize(14)
  doc.text("Sales Performance", 14, yPos)
  yPos += 8

  // @ts-ignore - jsPDF types are not properly defined for autoTable
  doc.autoTable({
    startY: yPos,
    head: [["Month", "Sales", "Revenue"]],
    body: data.salesData.map((item: any) => [item.month, item.sales, `$${item.revenue.toFixed(2)}`]),
  })

  // @ts-ignore - accessing lastAutoTable which is added by the plugin
  yPos = doc.lastAutoTable.finalY + 15

  // Add Commission Breakdown table
  doc.setFontSize(14)
  doc.text("Commission Breakdown", 14, yPos)
  yPos += 8

  // @ts-ignore
  doc.autoTable({
    startY: yPos,
    head: [["Policy Type", "Premium", "Commission"]],
    body: data.commissionData.map((item: any) => [
      item.name,
      `$${item.premium.toFixed(2)}`,
      `$${item.commission.toFixed(2)}`,
    ]),
  })

  // Add a new page for the next tables
  doc.addPage()
  yPos = 20

  // Add Policy Distribution table
  doc.setFontSize(14)
  doc.text("Policy Distribution", 14, yPos)
  yPos += 8

  // @ts-ignore
  doc.autoTable({
    startY: yPos,
    head: [["Policy Type", "Count"]],
    body: data.policyDistData.map((item: any) => [item.name, item.value]),
  })

  // @ts-ignore
  yPos = doc.lastAutoTable.finalY + 15

  // Add Client Activity table
  doc.setFontSize(14)
  doc.text("Client Activity", 14, yPos)
  yPos += 8

  // @ts-ignore
  doc.autoTable({
    startY: yPos,
    head: [["Status", "Count"]],
    body: data.clientActivityData.map((item: any) => [item.name, item.value]),
  })

  // Format date range for filename
  const dateString = formatDateRangeForFilename(dateRange)

  // Save the PDF
  doc.save(`analytics_report_${dateString}.pdf`)
}

// Helper function to format date range for filenames
function formatDateRangeForFilename(dateRange?: DateRange | undefined) {
  if (dateRange?.from) {
    const from = format(dateRange.from, "yyyy-MM-dd")
    const to = dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : "present"
    return `${from}_to_${to}`
  }

  return format(new Date(), "yyyy-MM-dd")
}
