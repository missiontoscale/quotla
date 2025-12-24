/**
 * Secure data transfer utilities
 *
 * Instead of passing sensitive data via URL query params (which exposes it in logs,
 * browser history, and referrer headers), we use sessionStorage as a temporary
 * secure transfer mechanism.
 */

const TRANSFER_KEY_PREFIX = 'quotla_transfer_'

export interface TransferData {
  type: 'quote' | 'invoice'
  data: any
  timestamp: number
}

/**
 * Generates a secure random transfer ID
 */
function generateTransferId(): string {
  // Use crypto.randomUUID if available, otherwise fallback to timestamp + random
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  // Fallback for older browsers
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
}

/**
 * Stores data securely in sessionStorage and returns a transfer ID
 *
 * @param type - Type of data being transferred
 * @param data - The actual data to transfer
 * @returns Transfer ID to be used in URL
 */
export function storeTransferData(type: 'quote' | 'invoice', data: any): string {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    throw new Error('sessionStorage not available')
  }

  const transferId = generateTransferId()
  const transferData: TransferData = {
    type,
    data,
    timestamp: Date.now(),
  }

  const key = `${TRANSFER_KEY_PREFIX}${transferId}`

  try {
    sessionStorage.setItem(key, JSON.stringify(transferData))
    return transferId
  } catch (error) {
    console.error('Failed to store transfer data:', error)
    throw new Error('Failed to securely store data')
  }
}

/**
 * Retrieves and removes data from sessionStorage using transfer ID
 *
 * @param transferId - The transfer ID from URL
 * @param expectedType - Expected type of data (for validation)
 * @returns The transferred data, or null if not found/expired
 */
export function retrieveTransferData(
  transferId: string,
  expectedType?: 'quote' | 'invoice'
): any | null {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return null
  }

  const key = `${TRANSFER_KEY_PREFIX}${transferId}`

  try {
    const stored = sessionStorage.getItem(key)
    if (!stored) {
      return null
    }

    const transferData: TransferData = JSON.parse(stored)

    // Validate timestamp (expire after 5 minutes)
    const EXPIRY_MS = 5 * 60 * 1000 // 5 minutes
    if (Date.now() - transferData.timestamp > EXPIRY_MS) {
      sessionStorage.removeItem(key)
      console.warn('Transfer data expired')
      return null
    }

    // Validate type if provided
    if (expectedType && transferData.type !== expectedType) {
      console.error(`Type mismatch: expected ${expectedType}, got ${transferData.type}`)
      sessionStorage.removeItem(key)
      return null
    }

    // Remove after retrieval (one-time use)
    sessionStorage.removeItem(key)

    return transferData.data

  } catch (error) {
    console.error('Failed to retrieve transfer data:', error)
    return null
  }
}

/**
 * Cleans up expired transfer data from sessionStorage
 * Call this periodically or on app initialization
 */
export function cleanupExpiredTransfers(): void {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return
  }

  const EXPIRY_MS = 5 * 60 * 1000 // 5 minutes
  const now = Date.now()

  try {
    // Iterate through all sessionStorage keys
    const keysToRemove: string[] = []

    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && key.startsWith(TRANSFER_KEY_PREFIX)) {
        try {
          const stored = sessionStorage.getItem(key)
          if (stored) {
            const transferData: TransferData = JSON.parse(stored)
            if (now - transferData.timestamp > EXPIRY_MS) {
              keysToRemove.push(key)
            }
          }
        } catch {
          // Invalid data, mark for removal
          keysToRemove.push(key)
        }
      }
    }

    // Remove expired keys
    keysToRemove.forEach(key => sessionStorage.removeItem(key))

    if (keysToRemove.length > 0) {
      console.log(`Cleaned up ${keysToRemove.length} expired transfer(s)`)
    }
  } catch (error) {
    console.error('Failed to cleanup expired transfers:', error)
  }
}

/**
 * Legacy function for backward compatibility
 * Tries to retrieve data from URL query param (old method)
 * Use this as fallback during migration
 *
 * @deprecated Use storeTransferData/retrieveTransferData instead
 */
export function getLegacyAIData(searchParams: URLSearchParams): any | null {
  try {
    const aiData = searchParams.get('ai_data')
    if (aiData) {
      console.warn('Using legacy URL-based data transfer. Please upgrade to secure transfer.')
      return JSON.parse(decodeURIComponent(aiData))
    }
  } catch (error) {
    console.error('Failed to parse legacy ai_data:', error)
  }
  return null
}
