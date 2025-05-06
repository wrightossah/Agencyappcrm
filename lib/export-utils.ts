import { jsPDF } from "jspdf"
import "jspdf-autotable"
import type { ReportType } from "./types"

// Format date for filenames
export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]
}

// Prepare report data for export
export function prepareReportData(reportType: ReportType, metrics: any[], charts: any, tables: any) {
  return {
    reportType,
    title: getReportTitle(reportType),
    date: formatDate(new Date()),
    metrics,
    charts,
    tables,
  }
}

// Get report title based on type
function getReportTitle(reportType: ReportType): string {
  switch (reportType) {
    case "policy-summary":
      return "Policy Summary Report"
    case "client-acquisition":
      return "Client Acquisition Report"
    case "revenue-analysis":
      return "Revenue Analysis Report"
    case "claims-report":
      return "Claims Report"
    default:
      return "Insurance Report"
  }
}

// Export report as PDF
export function exportToPDF(reportData: any, reportType: ReportType, clientName?: string) {
  const doc = new jsPDF()
  const title = reportData.title
  const date = reportData.date

  // Add title
  doc.setFontSize(20)
  doc.text(title, 14, 22)
  doc.setFontSize(12)
  doc.text(`Generated on: ${date}`, 14, 32)

  if (clientName) {
    doc.text(`Client: ${clientName}`, 14, 42)
  }

  let yPos = clientName ? 52 : 42

  // Add metrics
  if (reportData.metrics && reportData.metrics.length > 0) {
    doc.setFontSize(16)
    doc.text("Key Metrics", 14, yPos)
    yPos += 10

    reportData.metrics.forEach((metric: any) => {
      doc.setFontSize(12)
      doc.text(`${metric.title}: ${metric.value}`, 20, yPos)
      yPos += 8
      if (metric.description) {
        doc.setFontSize(10)
        doc.text(
          `${metric.description}${metric.trend ? ` (${metric.trend > 0 ? "+" : ""}${metric.trend}%)` : ""}`,
          30,
          yPos,
        )
        yPos += 8
      }
    })

    yPos += 10
  }

  // Add tables
  if (reportData.tables && Object.keys(reportData.tables).length > 0) {
    Object.entries(reportData.tables).forEach(([tableName, tableData]: [string, any]) => {
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }

      doc.setFontSize(16)
      doc.text(tableName, 14, yPos)
      yPos += 10

      // @ts-ignore - jsPDF types are not properly defined for autoTable
      doc.autoTable({
        startY: yPos,
        head: [tableData.headers],
        body: tableData.rows,
        margin: { top: 10 },
        styles: { overflow: "linebreak" },
        headStyles: { fillColor: [66, 66, 66] },
      })

      // @ts-ignore - accessing lastAutoTable which is added by the plugin
      yPos = doc.lastAutoTable.finalY + 16
    })
  }

  // Generate filename with client name if provided
  const filename = clientName
    ? `${reportType}-${clientName.replace(/\s+/g, "-").toLowerCase()}-${date}.pdf`
    : `${reportType}-${date}.pdf`

  // Save the PDF
  doc.save(filename)
}

// Export report as CSV
export function exportToCSV(reportData: any, reportType: ReportType, clientName?: string) {
  const title = reportData.title
  const date = reportData.date

  let csvContent = `"${title}"\n"Generated on: ${date}"\n`

  if (clientName) {
    csvContent += `"Client: ${clientName}"\n`
  }

  csvContent += "\n"

  // Add metrics
  if (reportData.metrics && reportData.metrics.length > 0) {
    csvContent += `"KEY METRICS"\n`
    reportData.metrics.forEach((metric: any) => {
      csvContent += `"${metric.title}","${metric.value}"\n`
    })
    csvContent += "\n"
  }

  // Add tables
  if (reportData.tables && Object.keys(reportData.tables).length > 0) {
    Object.entries(reportData.tables).forEach(([tableName, tableData]: [string, any]) => {
      csvContent += `"${tableName.toUpperCase()}"\n`

      // Add headers
      csvContent += tableData.headers.map((header: string) => `"${header}"`).join(",") + "\n"

      // Add rows
      tableData.rows.forEach((row: any[]) => {
        csvContent += row.map((cell) => `"${cell}"`).join(",") + "\n"
      })

      csvContent += "\n"
    })
  }

  // Generate filename with client name if provided
  const filename = clientName
    ? `${reportType}-${clientName.replace(/\s+/g, "-").toLowerCase()}-${date}.csv`
    : `${reportType}-${date}.csv`

  // Create a blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
