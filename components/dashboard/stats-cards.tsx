'use client'

/**
 * StatsCards Component
 * Displays key dashboard metrics in card format
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ActivityIcon, 
  AlertTriangleIcon, 
  TrendingUpIcon,
  ShieldIcon,
  LockIcon,
  WifiIcon,
} from 'lucide-react'
import type { DashboardStats } from '@/lib/types'
import { cn } from '@/lib/utils'

interface StatsCardsProps {
  stats: DashboardStats | null
  isLoading?: boolean
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toLocaleString()
}

function formatXLM(stroops: string): string {
  const xlm = parseInt(stroops) / 10000000
  if (xlm >= 1000000) {
    return `${(xlm / 1000000).toFixed(2)}M XLM`
  }
  if (xlm >= 1000) {
    return `${(xlm / 1000).toFixed(1)}K XLM`
  }
  return `${xlm.toFixed(2)} XLM`
}

function formatLastSync(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  
  if (diffSecs < 10) return 'Just now'
  if (diffSecs < 60) return `${diffSecs}s ago`
  
  const diffMins = Math.floor(diffSecs / 60)
  return `${diffMins}m ago`
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const cards = [
    {
      title: 'Transactions (24h)',
      value: stats ? formatNumber(stats.totalTransactions24h) : '--',
      icon: ActivityIcon,
      description: 'Total monitored',
      color: 'text-primary',
    },
    {
      title: 'Flagged',
      value: stats ? stats.flaggedTransactions.toString() : '--',
      icon: AlertTriangleIcon,
      description: 'Require review',
      color: 'text-warning',
    },
    {
      title: 'Value Monitored',
      value: stats ? formatXLM(stats.totalValueMonitored) : '--',
      icon: TrendingUpIcon,
      description: 'Total value',
      color: 'text-safe',
    },
    {
      title: 'Active Alerts',
      value: stats ? stats.activeAlerts.toString() : '--',
      icon: ShieldIcon,
      description: 'Unacknowledged',
      color: stats && stats.activeAlerts > 0 ? 'text-critical' : 'text-muted-foreground',
    },
    {
      title: 'Frozen Accounts',
      value: stats ? stats.frozenAccounts.toString() : '--',
      icon: LockIcon,
      description: 'Currently frozen',
      color: 'text-muted-foreground',
    },
    {
      title: 'Network Status',
      value: stats ? stats.networkStatus : '--',
      icon: WifiIcon,
      description: stats ? formatLastSync(stats.lastSync) : 'Syncing...',
      color: stats?.networkStatus === 'healthy' 
        ? 'text-safe' 
        : stats?.networkStatus === 'degraded' 
        ? 'text-warning' 
        : 'text-destructive',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <Card key={card.title} className={cn(isLoading && 'animate-pulse')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className={cn('h-4 w-4', card.color)} />
          </CardHeader>
          <CardContent>
            <div className={cn('text-2xl font-bold', card.color)}>
              {card.value}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
