'use client'

/**
 * useDashboard Hook
 * Fetches and manages dashboard data with SWR
 */

import useSWR from 'swr'
import type { DashboardStats, SecurityAlert, ApiResponse } from '@/lib/types'

interface DashboardData {
  stats: DashboardStats
  alerts: SecurityAlert[]
}

const fetcher = async (url: string): Promise<DashboardData> => {
  const response = await fetch(url)
  const json = await response.json() as ApiResponse<DashboardData>
  
  if (!json.success || !json.data) {
    throw new Error(json.error || 'Failed to fetch dashboard data')
  }
  
  return json.data
}

interface UseDashboardReturn {
  stats: DashboardStats | null
  alerts: SecurityAlert[]
  isLoading: boolean
  error: Error | null
  refresh: () => void
}

export function useDashboard(): UseDashboardReturn {
  const { data, error, isLoading, mutate } = useSWR<DashboardData>(
    '/api/dashboard',
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  )

  return {
    stats: data?.stats ?? null,
    alerts: data?.alerts ?? [],
    isLoading,
    error: error ?? null,
    refresh: () => mutate(),
  }
}
