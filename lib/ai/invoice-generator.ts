/**
 * Invoice generation using AI (OpenAI GPT-4)
 * Replaces regex-based extraction with proper AI generation
 */

import { generateInvoiceWithOpenAI, GeneratedInvoice } from './openai'

export interface InvoiceData {
  invoiceNumber: string
  date: string
  billTo: {
    name: string
    address: string
    city: string
    country: string
  }
  items: Array<{
    description: string
    unitPrice: number
    quantity: number
    subtotal: number
  }>
  tax: number
  delivery: number
  total: number
  currency: string
}

/**
 * Generate invoice data from natural language prompt using AI
 */
export async function generateInvoiceFromPrompt(prompt: string): Promise<InvoiceData> {
  // Use AI to generate invoice
  const aiInvoice: GeneratedInvoice = await generateInvoiceWithOpenAI(prompt)

  // Convert AI format to InvoiceData format for backward compatibility
  const invoiceData: InvoiceData = {
    invoiceNumber: aiInvoice.invoice_number || `#INV${String(Date.now()).slice(-6)}`,
    date: new Date().toISOString().split('T')[0],
    billTo: {
      name: aiInvoice.client_name || 'Client',
      address: 'Address', // AI doesn't always extract this
      city: 'City',
      country: 'Country'
    },
    items: aiInvoice.items.map(item => ({
      description: item.description,
      unitPrice: item.unit_price,
      quantity: item.quantity,
      subtotal: item.amount
    })),
    tax: aiInvoice.tax_amount || 0,
    delivery: aiInvoice.delivery_charge || 0,
    total: aiInvoice.total,
    currency: aiInvoice.currency || 'USD'
  }

  return invoiceData
}

/**
 * Format invoice data as readable text
 */
export function formatInvoice(invoice: InvoiceData): string {
  return `--- Invoice ---
Invoice Number: ${invoice.invoiceNumber}
Date: ${invoice.date}

Bill To:
${invoice.billTo.name}
${invoice.billTo.address}
${invoice.billTo.city}, ${invoice.billTo.country}

${invoice.items.map(item => `Description: ${item.description}
Unit Price: ${item.unitPrice.toLocaleString()} ${invoice.currency}
Quantity: ${item.quantity}
Subtotal: ${item.subtotal.toLocaleString()} ${invoice.currency}`).join('\n\n')}

Tax (${(invoice.tax / invoice.items[0].subtotal * 100).toFixed(0)}%): ${invoice.tax.toLocaleString()} ${invoice.currency}
Delivery (${(invoice.delivery / invoice.items[0].subtotal * 100).toFixed(0)}%): ${invoice.delivery.toLocaleString()} ${invoice.currency}

Total Amount Due: ${invoice.total.toLocaleString()} ${invoice.currency}`
}
