// More robust parser that extracts data from entire conversation history

interface ConversationMessage {
  role: string
  content: string
}

export interface ExtractedInvoiceData {
  business: {
    name: string
    address: string
  }
  client: {
    name: string
    address: string
  }
  items: Array<{
    description: string
    quantity: number
    unit_price: number
  }>
  currency: string
  delivery_cost_percentage?: number
  delivery_date?: string
  payment_terms?: string
  payment_details?: {
    account_number: string
    bank: string
    account_name: string
  }
}

export function extractInvoiceDataFromConversation(messages: ConversationMessage[]): ExtractedInvoiceData | null {
  // Combine all messages into one text for easier extraction
  const fullConversation = messages.map(m => m.content).join('\n')

  console.log('=== CONVERSATION PARSER START ===')
  console.log('Full conversation:', fullConversation.substring(0, 500) + '...')

  try {
    // Extract business info - try multiple patterns
    let businessNameMatch = fullConversation.match(/business\s+(?:named|name|is|called)?\s*([A-Z][A-Za-z\s&]+?)(?:,|\.|located|business)/i)
    if (!businessNameMatch) {
      businessNameMatch = fullConversation.match(/for\s+([A-Z][A-Za-z\s&]+?)\s+business/i)
    }
    if (!businessNameMatch) {
      businessNameMatch = fullConversation.match(/([A-Z][A-Za-z\s&]{2,}?)\s+located/i)
    }

    const businessAddressMatch = fullConversation.match(/located\s+at\s+([^,\n]+(?:,\s*[^,\n]+){0,2})/i)

    const business = {
      name: businessNameMatch?.[1]?.trim() || '',
      address: businessAddressMatch?.[1]?.trim() || ''
    }

    console.log('Extracted business:', business)

    // Extract client info (if mentioned)
    let clientNameMatch = fullConversation.match(/(?:client|customer|bill to|deliver to)[\s:]+(?:is\s+)?([A-Z][A-Za-z\s&]+?)(?:,|\.|located|in\s|$)/i)
    if (!clientNameMatch) {
      // Try pattern like "for XYZ Company" or "Client: XYZ"
      clientNameMatch = fullConversation.match(/(?:for|client:?)\s+([A-Z][A-Za-z\s&]+?)(?:\s+business|\s+company|\.|\n|$)/i)
    }

    let clientAddressMatch = fullConversation.match(/client.*?(?:located\s+at|in)\s+([^,\n\.]+)/i)
    if (!clientAddressMatch) {
      // Try pattern like "Client is in Location"
      clientAddressMatch = fullConversation.match(/(?:client|customer)[\s\w]*\s+(?:is\s+)?in\s+([A-Z][A-Za-z\s,]+?)(?:\.|$)/i)
    }

    const client = {
      name: clientNameMatch?.[1]?.trim() || 'Customer',
      address: clientAddressMatch?.[1]?.trim() || ''
    }

    console.log('Extracted client:', client)

    // Detect currency
    let currency = 'NGN'
    if (fullConversation.match(/naira|₦|NGN/i)) currency = 'NGN'
    else if (fullConversation.match(/\$/)) currency = 'USD'
    else if (fullConversation.match(/€|EUR/i)) currency = 'EUR'
    else if (fullConversation.match(/£|GBP/i)) currency = 'GBP'

    // Extract items - look for quantity + description + price patterns
    const items: Array<{description: string, quantity: number, unit_price: number}> = []

    // Pattern 1: "cost X dollars per hour" + "Y hours"
    const hourlyRateMatch = fullConversation.match(/(?:cost|rate|charge|price)[s]?\s+(?:is\s+)?[₦$€£]?(\d+(?:[,.]\d+)?)\s*(?:dollars?|naira|euros?|pounds?)?\s+per\s+hour/i)
    const hoursMatch = fullConversation.match(/(\d+)\s+hours?/i)

    if (hourlyRateMatch && hoursMatch) {
      const rate = parseFloat(hourlyRateMatch[1].replace(',', '.'))
      const hours = parseInt(hoursMatch[1])

      // Try to extract service description
      const serviceMatch = fullConversation.match(/(?:make|provide|offer|deliver|service)[s]?\s+([^\.]+?)\s+for/i) ||
                          fullConversation.match(/for\s+([^\.]+?)\s+(?:cost|charge|rate)/i)
      const description = serviceMatch?.[1]?.trim() || 'Service'

      console.log(`Parsed hourly service: ${hours} hours x ${description} @ ${rate}/hour`)

      items.push({
        description: `${description} (${hours} hours @ ${currency === 'USD' ? '$' : currency}${rate}/hr)`,
        quantity: hours,
        unit_price: rate
      })
    }

    // Pattern 2: "25 units of 200G selling at 5k"
    const itemPattern1 = /(\d+)\s+units?\s+of\s+([^,]+?)\s+(?:selling\s+at|at|for)\s+(\d+(?:[,.]\d+)?)\s*(k)?/gi
    let match
    while ((match = itemPattern1.exec(fullConversation)) !== null) {
      const quantity = parseInt(match[1])
      const description = match[2].trim()
      let price = parseFloat(match[3].replace(',', '.'))

      // Handle "k" notation - check if 'k' is captured in match[4]
      if (match[4] && match[4].toLowerCase() === 'k') {
        price = price * 1000
      }

      console.log(`Parsed item: ${quantity} x ${description} @ ${price} (original: ${match[0]})`)

      items.push({
        description,
        quantity,
        unit_price: price
      })
    }

    // Pattern 3: "10 units at 5000"
    const itemPattern2 = /(\d+)\s+units?\s+(?:at|for|@)\s+[₦$€£]?(\d+(?:,\d{3})*(?:\.\d{2})?)/gi
    while ((match = itemPattern2.exec(fullConversation)) !== null) {
      const quantity = parseInt(match[1])
      const price = parseFloat(match[2].replace(/,/g, ''))

      items.push({
        description: 'Item',
        quantity,
        unit_price: price
      })
    }

    // Extract delivery cost percentage
    const deliveryCostMatch = fullConversation.match(/delivery[^\.]*?(\d+)%/i)
    const delivery_cost_percentage = deliveryCostMatch ? parseInt(deliveryCostMatch[1]) : undefined

    // Extract delivery date
    const deliveryDateMatch = fullConversation.match(/delivery\s+date[:\s]+([^\n]+)/i) ||
                             fullConversation.match(/deliver(?:y)?[:\s]+([^,\n]+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|week|month)[^\n]*)/i)
    const delivery_date = deliveryDateMatch?.[1]?.trim()

    // Extract payment terms
    const paymentTermsMatch = fullConversation.match(/payment\s+(?:before|after|upon|terms?)[:\s]+([^\n]+)/i)
    const payment_terms = paymentTermsMatch?.[1]?.trim()

    // Extract payment details
    const accountNumberMatch = fullConversation.match(/account\s+(?:number|details?)[:\s]*(\d{10,})/i) ||
                               fullConversation.match(/(\d{10})/);
    const bankMatch = fullConversation.match(/bank[:\s]+([A-Z][A-Za-z\s]+?)(?:\n|business|account)/i)
    const accountNameMatch = fullConversation.match(/(?:account\s+name|business\s+name)[:\s]+([A-Z][A-Za-z\s&]+?)(?:\n|$)/i)

    const payment_details = accountNumberMatch ? {
      account_number: accountNumberMatch[1].trim(),
      bank: bankMatch?.[1]?.trim() || '',
      account_name: accountNameMatch?.[1]?.trim() || business.name
    } : undefined

    // Only return if we have essential data (at least items)
    if (items.length === 0) {
      console.log('❌ Missing essential data:', { itemsCount: items.length })
      console.log('=== CONVERSATION PARSER END (FAILED) ===')
      return null
    }

    // Provide defaults for missing data
    if (!business.name) {
      business.name = 'Your Business'
      console.log('⚠️ No business name found, using default')
    }

    const result = {
      business,
      client,
      items,
      currency,
      delivery_cost_percentage,
      delivery_date,
      payment_terms,
      payment_details
    }

    console.log('✅ Successfully extracted data:', result)
    console.log('=== CONVERSATION PARSER END (SUCCESS) ===')

    return result
  } catch (error) {
    console.error('Error extracting invoice data:', error)
    return null
  }
}
