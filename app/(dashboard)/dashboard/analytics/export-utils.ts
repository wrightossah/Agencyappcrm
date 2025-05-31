export const exportToCSV = (data: any, dateRange: any) => {
  const { salesData, commissionData, policyDistData, clientActivityData } = data

  // Create CSV content
  let csvContent = "AGENCYAPP Analytics Report\n"
  csvContent += `Generated on: ${new Date().toLocaleDateString()}\n`

  if (dateRange?.from && dateRange?.to) {
    csvContent += `Date Range: ${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}\n`
  }

  csvContent += "\n\nSales Performance\n"
  csvContent += "Month,Sales,Revenue\n"
  salesData.forEach((item: any) => {
    csvContent += `${item.month},${item.sales},${item.revenue}\n`
  })

  csvContent += "\n\nCommission Breakdown\n"
  csvContent += "Policy Type,Premium,Commission\n"
  commissionData.forEach((item: any) => {
    csvContent += `${item.name},${item.premium},${item.commission}\n`
  })

  csvContent += "\n\nPolicy Distribution\n"
  csvContent += "Policy Type,Count\n"
  policyDistData.forEach((item: any) => {
    csvContent += `${item.name},${item.value}\n`
  })

  csvContent += "\n\nClient Activity\n"
  csvContent += "Category,Count\n"
  clientActivityData.forEach((item: any) => {
    csvContent += `${item.name},${item.value}\n`
  })

  // Download CSV
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", `agencyapp-analytics-${new Date().toISOString().split("T")[0]}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const exportToPDF = (data: any, dateRange: any) => {
  // For now, we'll create a simple text-based PDF export
  // In a real application, you'd use a library like jsPDF
  const { salesData, commissionData, policyDistData, clientActivityData } = data

  let content = "AGENCYAPP Analytics Report\n\n"
  content += `Generated on: ${new Date().toLocaleDateString()}\n`

  if (dateRange?.from && dateRange?.to) {
    content += `Date Range: ${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}\n`
  }

  content += "\n\nSales Performance:\n"
  salesData.forEach((item: any) => {
    content += `${item.month}: ${item.sales} sales, ₵${item.revenue} revenue\n`
  })

  content += "\n\nCommission Breakdown:\n"
  commissionData.forEach((item: any) => {
    content += `${item.name}: ₵${item.premium} premium, ₵${item.commission} commission\n`
  })

  content += "\n\nPolicy Distribution:\n"
  policyDistData.forEach((item: any) => {
    content += `${item.name}: ${item.value} policies\n`
  })

  content += "\n\nClient Activity:\n"
  clientActivityData.forEach((item: any) => {
    content += `${item.name}: ${item.value} clients\n`
  })

  // Create a simple text file for now
  const blob = new Blob([content], { type: "text/plain;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", `agencyapp-analytics-${new Date().toISOString().split("T")[0]}.txt`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
