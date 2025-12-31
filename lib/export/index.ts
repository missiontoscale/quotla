import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import html2canvas from 'html2canvas'
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
  const documentTitle = isQuote ? 'QUOTATION' : 'INVOICE'
  const documentNumber = isQuote
    ? (data as QuoteWithItems).quote_number
    : (data as InvoiceWithItems).invoice_number
  const items = data.items

  // Add a subtle background color to the header area
  doc.setFillColor(248, 250, 252)
  doc.rect(0, 0, 210, 45, 'F')

  // Main title - centered and prominent
  doc.setFontSize(32)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(26, 26, 26)
  const titleWidth = doc.getTextWidth(documentTitle)
  doc.text(documentTitle, (210 - titleWidth) / 2, 20)

  // Document info section
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(100, 100, 100)
  doc.text(`${documentTitle} Number:`, 20, 55)
  doc.setFont('helvetica', 'normal')
  doc.text(documentNumber, 70, 55)

  doc.setFont('helvetica', 'bold')
  doc.text('Date:', 20, 62)
  doc.setFont('helvetica', 'normal')
  const issueDate = format(new Date(isQuote
    ? (data as QuoteWithItems).issue_date
    : (data as InvoiceWithItems).issue_date), 'MMM dd, yyyy')
  doc.text(issueDate, 70, 62)

  // Client info - Bill To section
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  const billLabel = isQuote ? 'To:' : 'Bill To:'
  doc.text(billLabel, 20, 80)

  if (data.client) {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(data.client.name, 20, 88)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    let clientY = 94

    if (data.client.address) {
      doc.text(data.client.address, 20, clientY)
      clientY += 5
    }

    const cityLine = `${data.client.city || ''}, ${data.client.country || ''}`.trim().replace(/^,\s*|,\s*$/g, '')
    if (cityLine) {
      doc.text(cityLine, 20, clientY)
    }
  }

  // Items table with enhanced styling
  const tableData = items.map((item) => [
    item.description,
    item.quantity.toString(),
    `${getCurrencySymbol(data.currency)} ${item.unit_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    `${getCurrencySymbol(data.currency)} ${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  ])

  autoTable(doc, {
    startY: 115,
    head: [['Description', 'Quantity', 'Unit Price', 'Amount']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [100, 100, 100],
      textColor: [245, 245, 245],
      fontStyle: 'bold',
      fontSize: 11,
      halign: 'left',
      cellPadding: 4,
    },
    bodyStyles: {
      fontSize: 10,
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 90, halign: 'left' },
      1: { cellWidth: 30, halign: 'right' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' },
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
    margin: { left: 20, right: 20 },
  })

  // Totals section with clean alignment
  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15

  const totalsX = 130
  const valuesX = 190

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)

  doc.text('Subtotal:', totalsX, finalY)
  doc.text(
    `${getCurrencySymbol(data.currency)} ${data.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    valuesX,
    finalY,
    { align: 'right' }
  )

  doc.text(`Tax (${(data.tax_rate * 100).toFixed(0)}%):`, totalsX, finalY + 7)
  doc.text(
    `${getCurrencySymbol(data.currency)} ${data.tax_amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    valuesX,
    finalY + 7,
    { align: 'right' }
  )

  // Add line separator before total
  doc.setLineWidth(0.5)
  doc.setDrawColor(0, 0, 0)
  doc.line(totalsX, finalY + 12, valuesX, finalY + 12)

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('TOTAL:', totalsX, finalY + 22)
  doc.text(
    `${getCurrencySymbol(data.currency)} ${data.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    valuesX,
    finalY + 22,
    { align: 'right' }
  )

  // Notes section
  let notesY = finalY + 35
  if (data.notes) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(100, 100, 100)
    doc.text('Notes:', 20, notesY)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    const splitNotes = doc.splitTextToSize(data.notes, 170)
    doc.text(splitNotes, 20, notesY + 6)
    notesY += 6 + (splitNotes.length * 5) + 10
  }

  // Terms
  const termsField = isQuote ? (data as QuoteWithItems).terms : (data as InvoiceWithItems).payment_terms
  if (termsField) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(100, 100, 100)
    doc.text(isQuote ? 'Terms & Conditions:' : 'Payment Terms:', 20, notesY)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    const splitTerms = doc.splitTextToSize(termsField, 170)
    doc.text(splitTerms, 20, notesY + 6)
  }

  // Footer
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(150, 150, 150)
  doc.text('Generated with Quotla', 105, 285, { align: 'center' })

  // Save
  doc.save(`${documentTitle.toLowerCase()}-${documentNumber}.pdf`)
}

export async function exportToWord(exportData: ExportData): Promise<void> {
  const { type, data, profile } = exportData
  const isQuote = type === 'quote'
  const documentTitle = isQuote ? 'QUOTATION' : 'INVOICE'
  const documentNumber = isQuote
    ? (data as QuoteWithItems).quote_number
    : (data as InvoiceWithItems).invoice_number
  const items = data.items

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Header - centered title
          new Paragraph({
            children: [
              new TextRun({
                text: documentTitle,
                bold: true,
                size: 52,
                color: '1a1a1a',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),

          // Document info
          new Paragraph({
            children: [
              new TextRun({
                text: `${documentTitle} Number: `,
                bold: true,
                size: 22,
              }),
              new TextRun({
                text: documentNumber,
                size: 22,
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Date: ',
                bold: true,
                size: 22,
              }),
              new TextRun({
                text: format(new Date(data.issue_date), 'MMM dd, yyyy'),
                size: 22,
              }),
            ],
            spacing: { after: 200 },
          }),

          // Client info
          new Paragraph({
            children: [
              new TextRun({
                text: isQuote ? 'To:' : 'Bill To:',
                bold: true,
                size: 26,
              }),
            ],
            spacing: { after: 100 },
          }),
          ...(data.client
            ? [
                new Paragraph({
                  children: [new TextRun({ text: data.client.name, bold: true, size: 24 })],
                }),
                ...(data.client.address
                  ? [
                      new Paragraph({
                        children: [new TextRun({ text: data.client.address, size: 22 })],
                      }),
                    ]
                  : []),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${data.client.city || ''}, ${data.client.country || ''}`.trim().replace(/^,\s*|,\s*$/g, ''),
                      size: 22,
                    }),
                  ],
                  spacing: { after: 300 },
                }),
              ]
            : [new Paragraph({ text: '', spacing: { after: 300 } })]),

          // Items table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'Description',
                            bold: true,
                            color: 'FFFFFF',
                          }),
                        ],
                      }),
                    ],
                    shading: { fill: '666666' },
                    width: { size: 50, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'Quantity',
                            bold: true,
                            color: 'FFFFFF',
                          }),
                        ],
                        alignment: AlignmentType.RIGHT,
                      }),
                    ],
                    shading: { fill: '666666' },
                    width: { size: 15, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'Unit Price',
                            bold: true,
                            color: 'FFFFFF',
                          }),
                        ],
                        alignment: AlignmentType.RIGHT,
                      }),
                    ],
                    shading: { fill: '666666' },
                    width: { size: 17.5, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'Amount',
                            bold: true,
                            color: 'FFFFFF',
                          }),
                        ],
                        alignment: AlignmentType.RIGHT,
                      }),
                    ],
                    shading: { fill: '666666' },
                    width: { size: 17.5, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              ...items.map(
                (item, index) =>
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph({ text: item.description })],
                        shading: index % 2 === 0 ? { fill: 'FAFAFA' } : undefined,
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            text: item.quantity.toString(),
                            alignment: AlignmentType.RIGHT,
                          }),
                        ],
                        shading: index % 2 === 0 ? { fill: 'FAFAFA' } : undefined,
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            text: `${getCurrencySymbol(data.currency)} ${item.unit_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                            alignment: AlignmentType.RIGHT,
                          }),
                        ],
                        shading: index % 2 === 0 ? { fill: 'FAFAFA' } : undefined,
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            text: `${getCurrencySymbol(data.currency)} ${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                            alignment: AlignmentType.RIGHT,
                          }),
                        ],
                        shading: index % 2 === 0 ? { fill: 'FAFAFA' } : undefined,
                      }),
                    ],
                  })
              ),
            ],
          }),
          new Paragraph({ text: '', spacing: { after: 200 } }),

          // Totals
          new Paragraph({
            children: [
              new TextRun({
                text: `Subtotal: ${getCurrencySymbol(data.currency)} ${data.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                size: 22,
              }),
            ],
            alignment: AlignmentType.RIGHT,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Tax (${(data.tax_rate * 100).toFixed(0)}%): ${getCurrencySymbol(data.currency)} ${data.tax_amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                size: 22,
              }),
            ],
            alignment: AlignmentType.RIGHT,
          }),
          new Paragraph({ text: '', spacing: { after: 100 } }),
          new Paragraph({
            children: [
              new TextRun({
                text: `TOTAL: ${getCurrencySymbol(data.currency)} ${data.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                bold: true,
                size: 32,
              }),
            ],
            alignment: AlignmentType.RIGHT,
            spacing: { after: 300 },
          }),

          // Notes
          ...(data.notes
            ? [
                new Paragraph({
                  children: [new TextRun({ text: 'Notes:', bold: true, size: 22, color: '666666' })],
                  spacing: { after: 100 },
                }),
                new Paragraph({
                  children: [new TextRun({ text: data.notes, size: 20 })],
                  spacing: { after: 200 },
                }),
              ]
            : []),

          // Terms
          ...(isQuote && (data as QuoteWithItems).terms
            ? [
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Terms & Conditions:', bold: true, size: 22, color: '666666' }),
                  ],
                  spacing: { after: 100 },
                }),
                new Paragraph({
                  children: [new TextRun({ text: (data as QuoteWithItems).terms!, size: 20 })],
                }),
              ]
            : []),
          ...(!isQuote && (data as InvoiceWithItems).payment_terms
            ? [
                new Paragraph({
                  children: [new TextRun({ text: 'Payment Terms:', bold: true, size: 22, color: '666666' })],
                  spacing: { after: 100 },
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

export async function exportToPNG(exportData: ExportData): Promise<void> {
  const { type, data } = exportData
  const isQuote = type === 'quote'
  const documentTitle = isQuote ? 'QUOTATION' : 'INVOICE'
  const documentNumber = isQuote
    ? (data as QuoteWithItems).quote_number
    : (data as InvoiceWithItems).invoice_number

  // Create a temporary div to render the document
  const tempDiv = document.createElement('div')
  tempDiv.style.width = '800px'
  tempDiv.style.padding = '40px'
  tempDiv.style.backgroundColor = '#ffffff'
  tempDiv.style.fontFamily = 'Arial, sans-serif'
  tempDiv.style.color = '#000000'

  const issueDate = format(new Date(data.issue_date), 'MMM dd, yyyy')

  tempDiv.innerHTML = `
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="font-size: 42px; font-weight: bold; color: #1a1a1a; margin: 0;">${documentTitle}</h1>
    </div>

    <div style="margin-bottom: 30px;">
      <p style="margin: 5px 0;"><strong>${documentTitle} Number:</strong> ${documentNumber}</p>
      <p style="margin: 5px 0;"><strong>Date:</strong> ${issueDate}</p>
    </div>

    <div style="margin-bottom: 30px;">
      <h3 style="font-size: 18px; margin-bottom: 10px;">${isQuote ? 'To:' : 'Bill To:'}</h3>
      ${data.client ? `
        <p style="margin: 5px 0; font-weight: bold;">${data.client.name}</p>
        ${data.client.address ? `<p style="margin: 5px 0;">${data.client.address}</p>` : ''}
        <p style="margin: 5px 0;">${data.client.city || ''}, ${data.client.country || ''}</p>
      ` : ''}
    </div>

    <div style="margin-bottom: 30px;">
      <h3 style="font-size: 16px; margin-bottom: 10px;">Items:</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #666666; color: white;">
            <th style="padding: 10px; text-align: left; border: 1px solid #ccc;">Description</th>
            <th style="padding: 10px; text-align: right; border: 1px solid #ccc;">Qty</th>
            <th style="padding: 10px; text-align: right; border: 1px solid #ccc;">Unit Price</th>
            <th style="padding: 10px; text-align: right; border: 1px solid #ccc;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${data.items.map((item, index) => `
            <tr style="background-color: ${index % 2 === 0 ? '#fafafa' : '#ffffff'};">
              <td style="padding: 10px; border: 1px solid #ccc;">${item.description}</td>
              <td style="padding: 10px; text-align: right; border: 1px solid #ccc;">${item.quantity}</td>
              <td style="padding: 10px; text-align: right; border: 1px solid #ccc;">${getCurrencySymbol(data.currency)} ${item.unit_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td style="padding: 10px; text-align: right; border: 1px solid #ccc;">${getCurrencySymbol(data.currency)} ${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div style="text-align: right; margin-bottom: 30px;">
      <p style="margin: 5px 0; font-size: 14px;"><strong>Subtotal:</strong> ${getCurrencySymbol(data.currency)} ${data.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      <p style="margin: 5px 0; font-size: 14px;"><strong>Tax (${(data.tax_rate * 100).toFixed(0)}%):</strong> ${getCurrencySymbol(data.currency)} ${data.tax_amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      <p style="margin: 10px 0 0 0; font-size: 18px; font-weight: bold;"><strong>TOTAL:</strong> ${getCurrencySymbol(data.currency)} ${data.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
    </div>

    ${data.notes ? `
      <div style="margin-bottom: 20px;">
        <h4 style="color: #666666; margin-bottom: 5px;">Notes:</h4>
        <p style="margin: 5px 0;">${data.notes}</p>
      </div>
    ` : ''}

    ${(isQuote && (data as QuoteWithItems).terms) || (!isQuote && (data as InvoiceWithItems).payment_terms) ? `
      <div style="margin-bottom: 20px;">
        <h4 style="color: #666666; margin-bottom: 5px;">${isQuote ? 'Terms & Conditions:' : 'Payment Terms:'}</h4>
        <p style="margin: 5px 0;">${isQuote ? (data as QuoteWithItems).terms : (data as InvoiceWithItems).payment_terms}</p>
      </div>
    ` : ''}

    <div style="text-align: center; margin-top: 40px;">
      <p style="font-size: 12px; color: #999999;">Generated with Quotla</p>
    </div>
  `

  document.body.appendChild(tempDiv)

  try {
    const canvas = await html2canvas(tempDiv, {
      backgroundColor: '#ffffff',
      scale: 2,
    })

    canvas.toBlob((blob) => {
      if (blob) {
        saveAs(blob, `${documentTitle.toLowerCase()}-${documentNumber}.png`)
      }
    })
  } finally {
    document.body.removeChild(tempDiv)
  }
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
