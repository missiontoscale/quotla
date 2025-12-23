export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-primary-800">
      <div className="mb-6 animate-pulse">
        <img
          src="/images/logos/icons/Quotla icon off white.svg"
          alt="Quotla"
          className="h-20 w-auto"
        />
      </div>
      <div className="relative">
        <div
          className="w-16 h-16 border-4 border-primary-600 border-t-primary-50 rounded-full animate-spin"
        ></div>
      </div>
      <p className="mt-6 text-primary-300 text-sm font-medium">Loading...</p>
    </div>
  )
}

export function InlineLoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  }

  const dotSizes = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  }

  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        <div
          className={`${sizeClasses[size]} rounded-full animate-spin`}
          style={{
            borderColor: 'var(--color-primary-lightest)',
            borderTopColor: 'var(--color-primary)'
          }}
        ></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div
            className={`${dotSizes[size]} rounded-full animate-pulse`}
            style={{ backgroundColor: 'var(--color-primary)' }}
          ></div>
        </div>
      </div>
    </div>
  )
}
