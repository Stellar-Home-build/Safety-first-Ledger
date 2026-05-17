'use client'

/**
 * LiveIndicator Component
 * Shows real-time connection status
 */

import { cn } from '@/lib/utils'

interface LiveIndicatorProps {
  isConnected: boolean
  error?: string | null
}

export function LiveIndicator({ isConnected, error }: LiveIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          'h-2 w-2 rounded-full',
          isConnected 
            ? 'bg-safe animate-pulse-safe' 
            : error 
            ? 'bg-critical' 
            : 'bg-muted-foreground'
        )}
      />
      <span className="text-sm text-muted-foreground">
        {isConnected ? 'Live' : error ? 'Reconnecting...' : 'Connecting...'}
      </span>
    </div>
  )
}
