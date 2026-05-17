/**
 * Dashboard Stats API Route
 * Fetch current dashboard statistics
 */

import { NextResponse } from 'next/server'
import { MOCK_DASHBOARD_STATS, MOCK_ALERTS } from '@/lib/mock-data'
import type { ApiResponse, DashboardStats, SecurityAlert } from '@/lib/types'

interface DashboardData {
  stats: DashboardStats
  alerts: SecurityAlert[]
}

export async function GET(): Promise<NextResponse<ApiResponse<DashboardData>>> {
  // Return current stats with some randomization to simulate live updates
  const stats: DashboardStats = {
    ...MOCK_DASHBOARD_STATS,
    totalTransactions24h: MOCK_DASHBOARD_STATS.totalTransactions24h + Math.floor(Math.random() * 100),
    flaggedTransactions: MOCK_DASHBOARD_STATS.flaggedTransactions + Math.floor(Math.random() * 5),
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
