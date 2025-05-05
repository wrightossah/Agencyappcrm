import { jsPDF } from "jspdf"
import "jspdf-autotable"
import type { ReportData } from "./types"

// Helper function to convert a date to a formatted string
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

// Export report data to CSV
export const exportToCSV = (reportData: ReportData, reportType: string): void => {
  // Create CSV content
  let csvContent = `"${reportData.title}"\n"${reportData.description}"\n\n`

  // Add metrics
  csvContent += '"Metrics:"\n'
  reportData.metrics.forEach((metric) => {
    csvContent += `"${metric.title}","${metric.value}","${metric.description || ""}"\n`
  })
  csvContent += "\n"

  // Add tables
  Object.entries(reportData.tables).forEach(([tableName, tableData]) => {
    csvContent += `"${tableName}"\n`

    // Add headers
    csvContent += tableData.headers.map((header) => `"${header}"`).join(",") + "\n"

    // Add rows
    tableData.rows.forEach((row) => {
      csvContent += row.map((cell) => `"${cell}"`).join(",") + "\n"
    })

    csvContent += "\n"
  })

  // Create a blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", `${reportType}-report-${formatDate(new Date())}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Export report data to PDF
export const exportToPDF = (reportData: ReportData, reportType: string): void => {
  // Create new PDF document
  const doc = new jsPDF()

  // Add title and description
  doc.setFontSize(18)
  doc.text(reportData.title, 14, 20)
  doc.setFontSize(12)
  doc.text(reportData.description, 14, 30)

  // Add metrics
  doc.setFontSize(14)
  doc.text("Key Metrics", 14, 45)

  let yPos = 55
  reportData.metrics.forEach((metric) => {
    doc.setFontSize(12)
    doc.text(`${metric.title}: ${metric.value}`, 20, yPos)
    if (metric.description) {
      doc.setFontSize(10)
      doc.text(metric.description, 20, yPos + 5)
      yPos += 15
    } else {
      yPos += 10
    }
  })

  // Add tables
  yPos += 10
  Object.entries(reportData.tables).forEach(([tableName, tableData]) => {
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }

    doc.setFontSize(14)
    doc.text(tableName, 14, yPos)
    yPos += 10

    // Convert table data to format expected by autoTable
    const tableHeaders = tableData.headers.map((header) => ({ title: header, dataKey: header }))
    const tableRows = tableData.rows.map((row) => {
      const rowObj: Record<string, any> = {}
      tableData.headers.forEach((header, index) => {
        rowObj[header] = row[index]
      })
      return rowObj
    })

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
    yPos = doc.lastAutoTable.finalY + 20
  })

  // Save the PDF
  doc.save(`${reportType}-report-${formatDate(new Date())}.pdf`)
}

// Function to prepare report data for export
export const prepareReportData = (reportType: string, metrics: any[], charts: any, tables: any): ReportData => {
  const titles: Record<string, string> = {
    "policy-summary": "Policy Summary Report",
    "client-acquisition": "Client Acquisition Report",
    "revenue-analysis": "Revenue Analysis Report",
    "claims-report": "Claims Report",
  }

  const descriptions: Record<string, string> = {
    "policy-summary": "Summary of all policy data and statistics",
    "client-acquisition": "Analysis of client acquisition and sources",
    "revenue-analysis": "Breakdown of revenue streams and growth",
    "claims-report": "Overview of claims filed, approved, and pending",
  }

  return {
    title: titles[reportType] || "Report",
    description: descriptions[reportType] || "Generated report data",
    metrics,
    charts,
    tables,
  }
}
