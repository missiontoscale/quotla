export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="relative">
        <div
          className="w-16 h-16 border-4 rounded-full animate-spin"
          style={{
            borderColor: 'var(--color-primary-lightest)',
            borderTopColor: 'var(--color-primary)'
          }}
        ></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div
            className="w-4 h-4 rounded-full animate-pulse"
            style={{ backgroundColor: 'var(--color-primary)' }}
          ></div>
        </div>
      </div>
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
