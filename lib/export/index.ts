import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  Document,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  AlignmentType,
  WidthType,
  Packer,
} from 'docx'
import { saveAs } from 'file-saver'
import { format } from 'date-fns'
import { QuoteWithItems, InvoiceWithItems, Profile, CURRENCIES } from '@/types'

interface ExportData {
  type: 'quote' | 'invoice'
  data: QuoteWithItems | InvoiceWithItems
  profile: Profile | null
}

const getCurrencySymbol = (code: string) => {
  const currency = CURRENCIES.find((c) => c.code === code)
  return currency?.symbol || code
}

const formatCurrency = (amount: number, currencyCode: string) => {
  const symbol = getCurrencySymbol(currencyCode)
  return `${symbol}${amount.toFixed(2)}`
}

export async function exportToPDF(exportData: ExportData): Promise<void> {
  const { type, data, profile } = exportData
  const doc = new jsPDF()

  const isQuote = type === 'quote'
  const documentTitle = isQuote ? 'QUOTE' : 'INVOICE'
  const documentNumber = isQuote
    ? (data as QuoteWithItems).quote_number
    : (data as InvoiceWithItems).invoice_number
  const items = data.items

  // Header
  doc.setFontSize(24)
  doc.setTextColor(79, 70, 229) // primary-600
  doc.text(documentTitle, 20, 20)

  // Document number
  doc.setFontSize(12)
  doc.setTextColor(100, 100, 100)
  doc.text(`#${documentNumber}`, 20, 30)

  // Company info (right side)
  doc.setFontSize(14)
  doc.setTextColor(0, 0, 0)
  doc.text(profile?.company_name || 'Your Company', 140, 20)

  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  let yPos = 27
  if (profile?.address) {
    doc.text(profile.address, 140, yPos)
    yPos += 5
  }
  if (profile?.city || profile?.state || profile?.postal_code) {
    doc.text(`${profile.city || ''} ${profile.state || ''} ${profile.postal_code || ''}`.trim(), 140, yPos)
    yPos += 5
  }
  if (profile?.country) {
    doc.text(profile.country, 140, yPos)
    yPos += 5
  }
  if (profile?.phone) {
    doc.text(`Phone: ${profile.phone}`, 140, yPos)
    yPos += 5
  }
  if (profile?.website) {
    doc.text(profile.website, 140, yPos)
  }

  // Client info
  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  doc.text('Bill To:', 20, 50)
  doc.setFontSize(11)
  if (data.client) {
    doc.text(data.client.name, 20, 58)
    let clientY = 64
    if (data.client.email) {
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text(data.client.email, 20, clientY)
      clientY += 5
    }
    if (data.client.address) {
      doc.text(data.client.address, 20, clientY)
      clientY += 5
    }
    if (data.client.city || data.client.state || data.client.postal_code) {
      doc.text(
        `${data.client.city || ''} ${data.client.state || ''} ${data.client.postal_code || ''}`.trim(),
        20,
        clientY
      )
    }
  }

  // Dates
  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  const issueDate = format(new Date(isQuote
    ? (data as QuoteWithItems).issue_date
    : (data as InvoiceWithItems).issue_date), 'MMM dd, yyyy')
  doc.text(`Issue Date: ${issueDate}`, 140, 50)

  if (isQuote && (data as QuoteWithItems).valid_until) {
    const validDate = format(new Date((data as QuoteWithItems).valid_until!), 'MMM dd, yyyy')
    doc.text(`Valid Until: ${validDate}`, 140, 58)
  } else if (!isQuote && (data as InvoiceWithItems).due_date) {
    const dueDate = format(new Date((data as InvoiceWithItems).due_date!), 'MMM dd, yyyy')
    doc.text(`Due Date: ${dueDate}`, 140, 58)
  }

  // Status
  doc.setTextColor(79, 70, 229)
  doc.text(`Status: ${data.status.toUpperCase()}`, 140, 66)

  // Title if present
  if (data.title) {
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text(data.title, 20, 95)
  }

  // Items table
  const tableData = items.map((item) => [
    item.description,
    item.quantity.toString(),
    formatCurrency(item.unit_price, data.currency),
    formatCurrency(item.amount, data.currency),
  ])

  autoTable(doc, {
    startY: data.title ? 105 : 95,
    head: [['Description', 'Qty', 'Unit Price', 'Amount']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: 255,
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' },
    },
    margin: { left: 20, right: 20 },
  })

  // Totals
  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10

  doc.setFontSize(11)
  doc.setTextColor(0, 0, 0)
  doc.text('Subtotal:', 130, finalY)
  doc.text(formatCurrency(data.subtotal, data.currency), 190, finalY, { align: 'right' })

  doc.text(`Tax (${data.tax_rate}%):`, 130, finalY + 8)
  doc.text(formatCurrency(data.tax_amount, data.currency), 190, finalY + 8, { align: 'right' })

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Total:', 130, finalY + 20)
  doc.text(formatCurrency(data.total, data.currency), 190, finalY + 20, { align: 'right' })

  // Notes
  if (data.notes) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text('Notes:', 20, finalY + 35)
    doc.setTextColor(0, 0, 0)
    const splitNotes = doc.splitTextToSize(data.notes, 170)
    doc.text(splitNotes, 20, finalY + 42)
  }

  // Terms
  const termsField = isQuote ? (data as QuoteWithItems).terms : (data as InvoiceWithItems).payment_terms
  if (termsField) {
    const termsY = data.notes ? finalY + 60 : finalY + 35
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(isQuote ? 'Terms & Conditions:' : 'Payment Terms:', 20, termsY)
    doc.setTextColor(0, 0, 0)
    const splitTerms = doc.splitTextToSize(termsField, 170)
    doc.text(splitTerms, 20, termsY + 7)
  }

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text('Generated with Quotla', 105, 285, { align: 'center' })

  // Save
  doc.save(`${documentTitle.toLowerCase()}-${documentNumber}.pdf`)
}

export async function exportToWord(exportData: ExportData): Promise<void> {
  const { type, data, profile } = exportData
  const isQuote = type === 'quote'
  const documentTitle = isQuote ? 'QUOTE' : 'INVOICE'
  const documentNumber = isQuote
    ? (data as QuoteWithItems).quote_number
    : (data as InvoiceWithItems).invoice_number
  const items = data.items

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Header
          new Paragraph({
            children: [
              new TextRun({
                text: documentTitle,
                bold: true,
                size: 48,
                color: '4F46E5',
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `#${documentNumber}`,
                size: 24,
                color: '666666',
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // Company info
          new Paragraph({
            children: [
              new TextRun({
                text: profile?.company_name || 'Your Company',
                bold: true,
                size: 28,
              }),
            ],
          }),
          ...(profile?.address
            ? [
                new Paragraph({
                  children: [new TextRun({ text: profile.address, size: 20, color: '666666' })],
                }),
              ]
            : []),
          ...(profile?.city || profile?.state
            ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${profile.city || ''} ${profile.state || ''} ${profile.postal_code || ''}`.trim(),
                      size: 20,
                      color: '666666',
                    }),
                  ],
                }),
              ]
            : []),
          new Paragraph({ text: '' }),

          // Client info
          new Paragraph({
            children: [
              new TextRun({
                text: 'Bill To:',
                bold: true,
                size: 24,
              }),
            ],
          }),
          ...(data.client
            ? [
                new Paragraph({
                  children: [new TextRun({ text: data.client.name, bold: true, size: 22 })],
                }),
                ...(data.client.email
                  ? [
                      new Paragraph({
                        children: [new TextRun({ text: data.client.email, size: 20, color: '666666' })],
                      }),
                    ]
                  : []),
              ]
            : []),
          new Paragraph({ text: '' }),

          // Dates
          new Paragraph({
            children: [
              new TextRun({
                text: `Issue Date: ${format(new Date(data.issue_date), 'MMM dd, yyyy')}`,
                size: 20,
              }),
            ],
          }),
          ...(isQuote && (data as QuoteWithItems).valid_until
            ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Valid Until: ${format(new Date((data as QuoteWithItems).valid_until!), 'MMM dd, yyyy')}`,
                      size: 20,
                    }),
                  ],
                }),
              ]
            : []),
          ...(!isQuote && (data as InvoiceWithItems).due_date
            ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Due Date: ${format(new Date((data as InvoiceWithItems).due_date!), 'MMM dd, yyyy')}`,
                      size: 20,
                    }),
                  ],
                }),
              ]
            : []),
          new Paragraph({
            children: [
              new TextRun({
                text: `Status: ${data.status.toUpperCase()}`,
                bold: true,
                size: 20,
                color: '4F46E5',
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // Title
          ...(data.title
            ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: data.title,
                      bold: true,
                      size: 28,
                    }),
                  ],
                }),
                new Paragraph({ text: '' }),
              ]
            : []),

          // Items table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: 'Description', bold: true })],
                      }),
                    ],
                    shading: { fill: '4F46E5' },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: 'Qty', bold: true })],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    shading: { fill: '4F46E5' },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: 'Unit Price', bold: true })],
                        alignment: AlignmentType.RIGHT,
                      }),
                    ],
                    shading: { fill: '4F46E5' },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: 'Amount', bold: true })],
                        alignment: AlignmentType.RIGHT,
                      }),
                    ],
                    shading: { fill: '4F46E5' },
                  }),
                ],
              }),
              ...items.map(
                (item) =>
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph({ text: item.description })],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            text: item.quantity.toString(),
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            text: formatCurrency(item.unit_price, data.currency),
                            alignment: AlignmentType.RIGHT,
                          }),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            text: formatCurrency(item.amount, data.currency),
                            alignment: AlignmentType.RIGHT,
                          }),
                        ],
                      }),
                    ],
                  })
              ),
            ],
          }),
          new Paragraph({ text: '' }),

          // Totals
          new Paragraph({
            children: [
              new TextRun({
                text: `Subtotal: ${formatCurrency(data.subtotal, data.currency)}`,
                size: 22,
              }),
            ],
            alignment: AlignmentType.RIGHT,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Tax (${data.tax_rate}%): ${formatCurrency(data.tax_amount, data.currency)}`,
                size: 22,
              }),
            ],
            alignment: AlignmentType.RIGHT,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Total: ${formatCurrency(data.total, data.currency)}`,
                bold: true,
                size: 28,
              }),
            ],
            alignment: AlignmentType.RIGHT,
          }),
          new Paragraph({ text: '' }),

          // Notes
          ...(data.notes
            ? [
                new Paragraph({
                  children: [new TextRun({ text: 'Notes:', bold: true, size: 20, color: '666666' })],
                }),
                new Paragraph({
                  children: [new TextRun({ text: data.notes, size: 20 })],
                }),
                new Paragraph({ text: '' }),
              ]
            : []),

          // Terms
          ...(isQuote && (data as QuoteWithItems).terms
            ? [
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Terms & Conditions:', bold: true, size: 20, color: '666666' }),
                  ],
                }),
                new Paragraph({
                  children: [new TextRun({ text: (data as QuoteWithItems).terms!, size: 20 })],
                }),
              ]
            : []),
          ...(!isQuote && (data as InvoiceWithItems).payment_terms
            ? [
                new Paragraph({
                  children: [new TextRun({ text: 'Payment Terms:', bold: true, size: 20, color: '666666' })],
                }),
                new Paragraph({
                  children: [new TextRun({ text: (data as InvoiceWithItems).payment_terms!, size: 20 })],
                }),
              ]
            : []),

          // Footer
          new Paragraph({ text: '' }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Generated with Quotla',
                size: 16,
                color: '999999',
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
        ],
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `${documentTitle.toLowerCase()}-${documentNumber}.docx`)
}

export function exportToJSON(exportData: ExportData): void {
  const { type, data, profile } = exportData
  const isQuote = type === 'quote'
  const documentNumber = isQuote
    ? (data as QuoteWithItems).quote_number
    : (data as InvoiceWithItems).invoice_number

  const jsonData = {
    type,
    document_number: documentNumber,
    created_at: data.created_at,
    updated_at: data.updated_at,
    status: data.status,
    issue_date: data.issue_date,
    ...(isQuote
      ? { valid_until: (data as QuoteWithItems).valid_until }
      : { due_date: (data as InvoiceWithItems).due_date }),
    title: data.title,
    client: data.client
      ? {
          name: data.client.name,
          email: data.client.email,
          phone: data.client.phone,
          address: data.client.address,
          city: data.client.city,
          state: data.client.state,
          postal_code: data.client.postal_code,
          country: data.client.country,
        }
      : null,
    business: profile ? {
      name: profile.company_name,
      business_number: profile.business_number,
      tax_id: profile.tax_id,
      address: profile.address,
      city: profile.city,
      state: profile.state,
      postal_code: profile.postal_code,
      country: profile.country,
      phone: profile.phone,
      website: profile.website,
    } : null,
    currency: data.currency,
    items: data.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      amount: item.amount,
    })),
    subtotal: data.subtotal,
    tax_rate: data.tax_rate,
    tax_amount: data.tax_amount,
    total: data.total,
    notes: data.notes,
    ...(isQuote
      ? { terms: (data as QuoteWithItems).terms }
      : { payment_terms: (data as InvoiceWithItems).payment_terms }),
  }

  const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' })
  saveAs(blob, `${type}-${documentNumber}.json`)
}
