'use client'

/**
 * AlertBanner Component
 * Displays critical security alerts at the top of the dashboard
 */

import { useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { 
  AlertTriangleIcon, 
  XIcon, 
  ChevronRightIcon,
  ShieldAlertIcon,
  InfoIcon,
  AlertCircleIcon,
} from 'lucide-react'
import type { SecurityAlert, RiskLevel } from '@/lib/types'
import { cn } from '@/lib/utils'

interface AlertBannerProps {
  alerts: SecurityAlert[]
  onAcknowledge: (alertId: string) => void
  onViewDetails?: (alert: SecurityAlert) => void
}

function getAlertIcon(severity: RiskLevel) {
  switch (severity) {
    case 'critical':
      return <ShieldAlertIcon className="h-5 w-5" />
    case 'high':
      return <AlertTriangleIcon className="h-5 w-5" />
    case 'medium':
      return <AlertCircleIcon className="h-5 w-5" />
    default:
      return <InfoIcon className="h-5 w-5" />
  }
}

function getAlertStyles(severity: RiskLevel) {
  switch (severity) {
    case 'critical':
      return 'border-critical/50 bg-critical/10 text-critical [&>svg]:text-critical animate-pulse-critical'
    case 'high':
      return 'border-warning/50 bg-warning/10 text-warning [&>svg]:text-warning'
    case 'medium':
      return 'border-primary/50 bg-primary/10 text-primary [&>svg]:text-primary'
    default:
      return 'border-muted bg-muted/50 text-muted-foreground [&>svg]:text-muted-foreground'
  }
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  
  return date.toLocaleDateString()
}

export function AlertBanner({ alerts, onAcknowledge, onViewDetails }: AlertBannerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  
  // Only show unacknowledged alerts, sorted by severity
  const activeAlerts = alerts
    .filter(a => !a.acknowledged)
    .sort((a, b) => {
      const severityOrder: Record<RiskLevel, number> = { critical: 0, high: 1, medium: 2, low: 3 }
      return severityOrder[a.severity] - severityOrder[b.severity]
    })
  
  if (activeAlerts.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-3">
      {activeAlerts.slice(0, 3).map((alert) => (
        <Alert 
          key={alert.id} 
          className={cn(
            'relative transition-all duration-200',
            getAlertStyles(alert.severity)
          )}
        >
          {getAlertIcon(alert.severity)}
          <div className="flex-1">
            <AlertTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                {alert.title}
                <span className="text-xs font-normal opacity-70">
                  {formatTimestamp(alert.timestamp)}
                </span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                onClick={() => onAcknowledge(alert.id)}
              >
                <XIcon className="h-4 w-4" />
                <span className="sr-only">Dismiss alert</span>
              </Button>
            </AlertTitle>
            <AlertDescription 
              className={cn(
                'mt-1 transition-all duration-200',
                expandedId === alert.id ? 'line-clamp-none' : 'line-clamp-2'
              )}
            >
              {alert.message}
            </AlertDescription>
            <div className="mt-2 flex items-center gap-2">
              {alert.message.length > 100 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs hover:bg-transparent"
                  onClick={() => setExpandedId(expandedId === alert.id ? null : alert.id)}
                >
                  {expandedId === alert.id ? 'Show less' : 'Show more'}
                </Button>
              )}
              {onViewDetails && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs hover:bg-transparent"
                  onClick={() => onViewDetails(alert)}
                >
                  View details
                  <ChevronRightIcon className="ml-1 h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </Alert>
      ))}
      {activeAlerts.length > 3 && (
        <p className="text-sm text-muted-foreground text-center">
          +{activeAlerts.length - 3} more alerts
        </p>
      )}
    </div>
  )
}
