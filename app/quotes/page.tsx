'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function QuotesPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard?quotes=open')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
    </div>
  )
}
