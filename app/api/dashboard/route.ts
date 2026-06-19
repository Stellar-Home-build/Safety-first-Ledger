/**
 * Dashboard Stats API Route
 * Fetch current dashboard statistics
 */

import { NextResponse } from 'next/server'
import { server, horizonTxToTransaction } from '@/lib/stellar'
import { MOCK_ALERTS } from '@/lib/mock-data'
import type { ApiResponse, DashboardStats, SecurityAlert } from '@/lib/types'

interface DashboardData {
  stats: DashboardStats
  alerts: SecurityAlert[]
}

export async function GET(): Promise<NextResponse<ApiResponse<DashboardData>>> {
  try {
    // Fetch ledger info
    const ledger = await server.ledgers().order('desc').limit(1).call()
    const latestLedger = ledger.records[0]
    
    // Fetch recent transactions for last 24h (approx)
    // Note: Horizon doesn't provide 24h stats directly, so we'll use recent ledger data
    const txCount = latestLedger.transaction_count || 0
    
    const stats: DashboardStats = {
      totalTransactions24h: txCount,
      flaggedTransactions: 0,
      totalValueMonitored: '0',
      activeAlerts: MOCK_ALERTS.filter(a => !a.acknowledged).length,
      frozenAccounts: 0,
      networkStatus: 'healthy',
      lastSync: new Date().toISOString(),
    }
    
    return NextResponse.json({
      success: true,
      data: {
        stats,
        alerts: MOCK_ALERTS,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error)
    // Fallback to mock data if Horizon fails
    const stats: DashboardStats = {
      totalTransactions24h: 0,
      flaggedTransactions: 0,
      totalValueMonitored: '0',
      activeAlerts: 0,
      frozenAccounts: 0,
      networkStatus: 'degraded',
      lastSync: new Date().toISOString(),
    }
    
    return NextResponse.json({
      success: true,
      data: {
        stats,
        alerts: MOCK_ALERTS,
      },
      timestamp: new Date().toISOString(),
    })
  }
}
