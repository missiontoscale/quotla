export async function generateDescriptionWithGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_API_KEY

  if (!apiKey) {
    throw new Error('GOOGLE_AI_API_KEY is not configured')
  }

  const systemPrompt = `You are a professional business writer helping to create clear, professional descriptions for quotes and invoices.

The user will describe a service or product, and you should generate a concise, professional description suitable for a business quote or invoice line item.

Keep it professional, clear, and focused on the value provided. Use 2-4 sentences maximum.

Generate only the description, without any preamble or additional commentary.`

  const fullPrompt = `${systemPrompt}\n\nUser request: ${prompt}`

  try {
    // Use REST API directly for better compatibility
    // Using gemini-1.5-flash model (latest stable model)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: fullPrompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Gemini API error:', errorData)
      throw new Error(
        errorData?.error?.message || `API request failed with status ${response.status}`
      )
    }

    const data = await response.json()

    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      console.error('Unexpected Gemini response:', data)
      throw new Error('No content in Gemini response')
    }

    const description = data.candidates[0].content.parts[0].text.trim()

    if (!description) {
      throw new Error('No description generated')
    }

    return description
  } catch (error) {
    console.error('Gemini generation error:', error)

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('API_KEY_INVALID') || error.message.includes('invalid')) {
        throw new Error('Invalid Google AI API key. Please check your GOOGLE_AI_API_KEY.')
      }
      if (error.message.includes('quota') || error.message.includes('limit')) {
        throw new Error('Google AI API quota exceeded. Please try again later.')
      }
      if (error.message.includes('not found') || error.message.includes('404')) {
        throw new Error('Gemini model not available. Please check your API access.')
      }
      // Pass through the original error message for better debugging
      throw new Error(`Gemini error: ${error.message}`)
    }

    throw new Error('Failed to generate description with Gemini')
  }
}
