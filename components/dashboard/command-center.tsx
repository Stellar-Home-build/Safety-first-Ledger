'use client'

/**
 * CommandCenter Component
 * Main dashboard view with real-time transaction monitoring
 */

import { useTransactionStream } from '@/hooks/use-transaction-stream'
import { useDashboard } from '@/hooks/use-dashboard'
import { useWallet } from '@/hooks/use-wallet'
import { DashboardHeader } from './dashboard-header'
import { AlertBanner } from './alert-banner'
import { StatsCards } from './stats-cards'
import { TransactionTable } from './transaction-table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCwIcon, PauseIcon, PlayIcon } from 'lucide-react'
import { useState, useCallback, useMemo } from 'react'

export function CommandCenter() {
  const [isPaused, setIsPaused] = useState(false)
  
  const { 
    transactions: streamTransactions,
    alerts: streamAlerts,
    statsUpdates,
    isConnected,
    error,
    acknowledgeAlert,
    clearTransactions,
    disconnect,
    connect,
  } = useTransactionStream({
    autoConnect: true,
    maxTransactions: 100,
  })
  
  const { 
    stats: baseStats, 
    alerts: initialAlerts,
    isLoading: isLoadingDashboard,
    refresh: refreshDashboard,
  } = useDashboard()
  
  const { publicKey } = useWallet()

  // Merge base stats with stream updates
  const stats = useMemo(() => {
    if (!baseStats) return null
    return { ...baseStats, ...statsUpdates }
  }, [baseStats, statsUpdates])

  // Combine and deduplicate alerts
  const allAlerts = useMemo(() => {
    const alertMap = new Map<string, typeof initialAlerts[0]>()
    
    // Add initial alerts
    initialAlerts.forEach(alert => alertMap.set(alert.id, alert))
    
    // Add/update stream alerts (these take precedence)
    streamAlerts.forEach(alert => alertMap.set(alert.id, alert))
    
    return Array.from(alertMap.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [initialAlerts, streamAlerts])

  const handlePauseToggle = useCallback(() => {
    if (isPaused) {
      connect()
    } else {
      disconnect()
    }
    setIsPaused(!isPaused)
  }, [isPaused, connect, disconnect])

  const handleRefresh = useCallback(() => {
    refreshDashboard()
    clearTransactions()
  }, [refreshDashboard, clearTransactions])

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader isConnected={isConnected} error={error} />
      
      <main className="flex-1 container py-6 space-y-6">
        {/* Alerts */}
        <AlertBanner 
          alerts={allAlerts} 
          onAcknowledge={acknowledgeAlert}
        />

        {/* Stats */}
        <StatsCards stats={stats} isLoading={isLoadingDashboard} />

        {/* Transaction Feed */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Live Transaction Feed</CardTitle>
              <CardDescription>
                Real-time transactions with risk assessment
                {streamTransactions.length > 0 && (
                  <span className="ml-2 text-foreground">
                    ({streamTransactions.length} transactions)
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
              >
                <RefreshCwIcon className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePauseToggle}
              >
                {isPaused ? (
                  <>
                    <PlayIcon className="h-4 w-4 mr-2" />
                    Resume
                  </>
                ) : (
                  <>
                    <PauseIcon className="h-4 w-4 mr-2" />
                    Pause
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <TransactionTable 
              transactions={streamTransactions}
              maxRows={15}
              showPagination={streamTransactions.length > 15}
              walletAddress={publicKey}
            />
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-4">
        <div className="container flex items-center justify-between text-sm text-muted-foreground">
          <span>SFLM Security Dashboard v1.0.0</span>
          <span>Connected to Stellar Testnet</span>
        </div>
      </footer>
    </div>
  )
}
