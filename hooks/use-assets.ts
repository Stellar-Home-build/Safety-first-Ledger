'use client'

/**
 * useAssets Hook
 * Fetches and manages asset inventory with SWR
 */

import useSWR from 'swr'
import { useState, useCallback } from 'react'
import type { Asset, ApiResponse, FreezeStatus, FreezeResponse } from '@/lib/types'

interface AssetsData {
  assets: Asset[]
}

const fetcher = async (url: string): Promise<Asset[]> => {
  const response = await fetch(url)
  const json = await response.json() as ApiResponse<AssetsData>
  
  if (!json.success || !json.data) {
    throw new Error(json.error || 'Failed to fetch assets')
  }
  
  return json.data.assets
}

interface UseAssetsReturn {
  assets: Asset[]
  isLoading: boolean
  error: Error | null
  refresh: () => void
  filterByStatus: (status: FreezeStatus | null) => void
  currentFilter: FreezeStatus | null
  freezeAsset: (assetCode: string, reason: string, targetAccount?: string) => Promise<FreezeResponse>
  isFreezing: boolean
}

export function useAssets(): UseAssetsReturn {
  const [currentFilter, setCurrentFilter] = useState<FreezeStatus | null>(null)
  const [isFreezing, setIsFreezing] = useState(false)

  const url = currentFilter 
    ? `/api/assets?status=${currentFilter}` 
    : '/api/assets'

  const { data, error, isLoading, mutate } = useSWR<Asset[]>(
    url,
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true,
    }
  )

  const filterByStatus = useCallback((status: FreezeStatus | null) => {
    setCurrentFilter(status)
  }, [])

  const freezeAsset = useCallback(async (
    assetCode: string, 
    reason: string, 
    targetAccount?: string
  ): Promise<FreezeResponse> => {
    setIsFreezing(true)
    
    try {
      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assetCode,
          reason,
          targetAccount,
        }),
      })
      
      const json = await response.json() as ApiResponse<FreezeResponse>
      
      if (!json.success || !json.data) {
        throw new Error(json.error || 'Failed to freeze asset')
      }
      
      // Refresh the assets list
      mutate()
      
      return json.data
    } finally {
      setIsFreezing(false)
    }
  }, [mutate])

  return {
    assets: data ?? [],
    isLoading,
    error: error ?? null,
    refresh: () => mutate(),
    filterByStatus,
    currentFilter,
    freezeAsset,
    isFreezing,
  }
}
