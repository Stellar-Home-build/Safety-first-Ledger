'use client'

/**
 * useTransactionStream Hook
 * Manages SSE connection for real-time transaction monitoring
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Transaction, SecurityAlert, DashboardStats, TransactionStreamEvent } from '@/lib/types'

interface UseTransactionStreamOptions {
  /** Maximum number of transactions to keep in memory */
  maxTransactions?: number
  /** Whether to auto-connect on mount */
  autoConnect?: boolean
  /** Callback for new transactions */
  onTransaction?: (transaction: Transaction) => void
  /** Callback for new alerts */
  onAlert?: (alert: SecurityAlert) => void
}

interface UseTransactionStreamReturn {
  /** Recent transactions from the stream */
  transactions: Transaction[]
  /** Active security alerts */
  alerts: SecurityAlert[]
  /** Partial stats updates from the stream */
  statsUpdates: Partial<DashboardStats>
  /** Whether the stream is connected */
  isConnected: boolean
  /** Connection error if any */
  error: string | null
  /** Connect to the stream */
  connect: () => void
  /** Disconnect from the stream */
  disconnect: () => void
  /** Clear all transactions */
  clearTransactions: () => void
  /** Acknowledge an alert */
  acknowledgeAlert: (alertId: string) => void
}

export function useTransactionStream(
  options: UseTransactionStreamOptions = {}
): UseTransactionStreamReturn {
  const {
    maxTransactions = 100,
    autoConnect = true,
    onTransaction,
    onAlert,
  } = options

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [alerts, setAlerts] = useState<SecurityAlert[]>([])
  const [statsUpdates, setStatsUpdates] = useState<Partial<DashboardStats>>({})
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const connect = useCallback(() => {
    // Clean up existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }

    setError(null)

    try {
      const eventSource = new EventSource('/api/transactions/stream')
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        setIsConnected(true)
        setError(null)
      }

      eventSource.onmessage = (event) => {
        try {
          const streamEvent = JSON.parse(event.data) as TransactionStreamEvent

          switch (streamEvent.type) {
            case 'transaction': {
              const transaction = streamEvent.payload as Transaction
              setTransactions((prev) => {
                const updated = [transaction, ...prev].slice(0, maxTransactions)
                return updated
              })
              onTransaction?.(transaction)
              break
            }
            case 'alert': {
              const alert = streamEvent.payload as SecurityAlert
              setAlerts((prev) => [alert, ...prev])
              onAlert?.(alert)
              break
            }
            case 'stats_update': {
              const stats = streamEvent.payload as Partial<DashboardStats>
              setStatsUpdates((prev) => ({ ...prev, ...stats }))
              break
            }
          }
        } catch (parseError) {
          console.error('Failed to parse stream event:', parseError)
        }
      }

      eventSource.onerror = () => {
        setIsConnected(false)
        setError('Connection lost. Reconnecting...')
        eventSource.close()
        
        // Attempt to reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect()
        }, 5000)
      }
    } catch (connectionError) {
      setError('Failed to connect to transaction stream')
      setIsConnected(false)
    }
  }, [maxTransactions, onTransaction, onAlert])

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    setIsConnected(false)
  }, [])

  const clearTransactions = useCallback(() => {
    setTransactions([])
  }, [])

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    )
  }, [])

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [autoConnect, connect, disconnect])

  return {
    transactions,
    alerts,
    statsUpdates,
    isConnected,
    error,
    connect,
    disconnect,
    clearTransactions,
    acknowledgeAlert,
  }
}
