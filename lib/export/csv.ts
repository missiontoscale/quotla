import * as XLSX from 'xlsx'

export interface InvoiceExportRow {
  date: string
  invoice_number: string
  client: string
  items_summary: string
  subtotal: number
  tax: number
  total: number
  status: string
  currency: string
}

export function exportToCSV(rows: InvoiceExportRow[], filename: string): void {
  const headers = ['Date', 'Invoice #', 'Client', 'Items Summary', 'Subtotal', 'Tax', 'Total', 'Status', 'Currency']
  const csvRows = rows.map((r) => [
    r.date,
    r.invoice_number,
    r.client,
    r.items_summary,
    r.subtotal.toFixed(2),
    r.tax.toFixed(2),
    r.total.toFixed(2),
    r.status,
    r.currency,
  ])

  const csvContent = [headers, ...csvRows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function exportToXLSX(rows: InvoiceExportRow[], filename: string): void {
  const data = rows.map((r) => ({
    Date: r.date,
    'Invoice #': r.invoice_number,
    Client: r.client,
    'Items Summary': r.items_summary,
    Subtotal: r.subtotal,
    Tax: r.tax,
    Total: r.total,
    Status: r.status,
    Currency: r.currency,
  }))

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoices')
  XLSX.writeFile(workbook, `${filename}.xlsx`)
}