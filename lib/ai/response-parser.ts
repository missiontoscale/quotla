// Parses AI responses to extract structured invoice/quote data

export interface ParsedInvoiceData {
  type: 'invoice'
  business: {
    name: string
    address?: string
  }
  client: {
    name: string
    address?: string
  }
  items: Array<{
    description: string
    quantity: number
    unit_price: number
  }>
  additional_charges?: Array<{
    description: string
    amount: number
  }>
  currency: string
  notes?: string
}

export interface ParsedQuoteData {
  type: 'quote'
  business: {
    name: string
    address?: string
  }
  client: {
    name: string
    address?: string
  }
  items: Array<{
    description: string
    quantity: number
    unit_price: number
  }>
  additional_charges?: Array<{
    description: string
    amount: number
  }>
  currency: string
  notes?: string
}

export type ParsedDocumentData = ParsedInvoiceData | ParsedQuoteData

export function parseAIResponse(response: string): ParsedDocumentData | null {
  const lowerResponse = response.toLowerCase()

  // Determine if this is an invoice or quote
  const isInvoice = lowerResponse.includes('invoice') && !lowerResponse.includes('quote')
  const isQuote = lowerResponse.includes('quote')

  if (!isInvoice && !isQuote) return null

  try {
    // Try to extract business info (more flexible patterns)
    let businessMatch = response.match(/(?:invoice for|quote for|from|business|company)[\s:]+([^\n,]+?)(?:[\n,]|located at|address)/i)
    if (!businessMatch) {
      businessMatch = response.match(/([A-Z][A-Za-z\s&]+)(?:\s+located at|,\s*located at)/i)
    }
    const business = {
      name: businessMatch?.[1]?.trim() || '',
      address: ''
    }

    // Extract business address if mentioned
    const businessAddressMatch = response.match(/(?:located at|address[:\s]+)([^\n]+?)(?:\n|customer|client|bill to)/i)
    if (businessAddressMatch) {
      business.address = businessAddressMatch[1].trim()
    }

    // Try to extract client info (more flexible patterns)
    let clientMatch = response.match(/(?:bill to|client|customer|to)[:\s]+([^\n]+?)(?:\n|located at|address|he is|she is|they are)/i)
    if (!clientMatch) {
      clientMatch = response.match(/(?:customer is|client is)[\s:]+([^\n,]+)/i)
    }
    const client = {
      name: clientMatch?.[1]?.trim() || '',
      address: ''
    }

    // Extract client address
    const clientAddressMatch = response.match(/(?:located at|address[:\s]+)([^\n]+?)(?:\n|he is|she is|they are|description)/i)
    if (clientAddressMatch && clientAddressMatch[1] !== business.address) {
      client.address = clientAddressMatch[1].trim()
    }

    // Extract currency (look for common symbols and codes)
    let currency = 'USD'
    if (response.includes('₦') || response.includes('NGN')) currency = 'NGN'
    else if (response.includes('$') || response.includes('USD')) currency = 'USD'
    else if (response.includes('€') || response.includes('EUR')) currency = 'EUR'
    else if (response.includes('£') || response.includes('GBP')) currency = 'GBP'

    // Extract line items - look for patterns like "10 units of X at $500" or "- Item: $100"
    const items: Array<{ description: string; quantity: number; unit_price: number }> = []

    // Pattern 1: "X units of [description] at [price] per unit"
    const unitsPattern = /(\d+)\s+units?\s+of\s+([^@\n]+?)\s+at\s+[₦$€£]?([0-9,]+)/gi
    let match
    while ((match = unitsPattern.exec(response)) !== null) {
      items.push({
        description: match[2].trim(),
        quantity: parseInt(match[1]),
        unit_price: parseFloat(match[3].replace(/,/g, ''))
      })
    }

    // Pattern 2: "- [description]: [price]" or "[description] - [price]"
    const itemPattern = /-\s*([^:₦$€£\n]+?)[\s:]+[₦$€£]?([0-9,]+)/gi
    while ((match = itemPattern.exec(response)) !== null) {
      const desc = match[1].trim()
      if (!desc.toLowerCase().includes('subtotal') && !desc.toLowerCase().includes('total') && !desc.toLowerCase().includes('delivery')) {
        items.push({
          description: desc,
          quantity: 1,
          unit_price: parseFloat(match[2].replace(/,/g, ''))
        })
      }
    }

    // Extract additional charges (delivery, tax, etc.)
    const additional_charges: Array<{ description: string; amount: number }> = []

    const deliveryMatch = response.match(/(?:delivery|shipping)[\s\w()%]*:?\s*[₦$€£]?([0-9,]+)/i)
    if (deliveryMatch) {
      additional_charges.push({
        description: 'Delivery',
        amount: parseFloat(deliveryMatch[1].replace(/,/g, ''))
      })
    }

    const taxMatch = response.match(/(?:tax|vat)[\s\w()%]*:?\s*[₦$€£]?([0-9,]+)/i)
    if (taxMatch) {
      additional_charges.push({
        description: 'Tax',
        amount: parseFloat(taxMatch[1].replace(/,/g, ''))
      })
    }

    // Only return if we have essential data (at least items)
    if (items.length === 0) {
      return null
    }

    // Provide defaults for missing data
    if (!business.name) business.name = 'Your Business'
    if (!client.name) client.name = 'Customer'

    const baseData = {
      business,
      client,
      items,
      additional_charges: additional_charges.length > 0 ? additional_charges : undefined,
      currency,
      notes: undefined
    }

    return {
      type: isInvoice ? 'invoice' : 'quote',
      ...baseData
    } as ParsedDocumentData

  } catch (error) {
    console.error('Error parsing AI response:', error)
    return null
  }
}

export function shouldCreateDocument(userMessage: string, aiResponse: string): boolean {
  const lowerUser = userMessage.toLowerCase()
  const lowerAI = aiResponse.toLowerCase()

  // Check if user is asking to create (more aggressive detection)
  const createKeywords = ['create', 'generate', 'make', 'build', 'prepare', 'actually create', 'go on', 'do it', 'now create']
  const hasCreateIntent = createKeywords.some(keyword => lowerUser.includes(keyword))

  // Check if AI provided structured invoice/quote data
  const hasStructuredData = (lowerAI.includes('invoice') || lowerAI.includes('quote')) &&
                            (lowerAI.includes('subtotal') || lowerAI.includes('total') || lowerAI.includes('amount'))

  // Also check if AI is providing line items
  const hasLineItems = lowerAI.includes('units of') || lowerAI.includes('quantity') ||
                       (lowerAI.includes('-') && (lowerAI.includes('₦') || lowerAI.includes('$')))

  return hasCreateIntent && (hasStructuredData || hasLineItems)
}
