'use client'

/**
 * useAssets Hook
 * Fetches and manages asset inventory with SWR
 */

import useSWR from 'swr'
import { useState, useCallback } from 'react'
import { signTransaction } from '@stellar/freighter-api'
import { useWallet } from './use-wallet'
import { buildTrustlineTransaction, submitTransaction } from '@/lib/stellar'
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
  executeAssetAction: (
    assetCode: string, 
    reason: string, 
    mode: 'freeze' | 'unfreeze',
    targetAccount?: string
  ) => Promise<FreezeResponse>
  isExecuting: boolean
}

export function useAssets(): UseAssetsReturn {
  const [currentFilter, setCurrentFilter] = useState<FreezeStatus | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const { isConnected, publicKey, network } = useWallet()

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

  const executeAssetAction = useCallback(async (
    assetCode: string, 
    reason: string, 
    mode: 'freeze' | 'unfreeze',
    targetAccount?: string
  ): Promise<FreezeResponse> => {
    setIsExecuting(true)
    
    try {
      if (!isConnected || !publicKey) {
        throw new Error('Please connect your wallet first')
      }
      
      // Find the asset in the list to get its issuer
      const asset = data?.find(a => a.code === assetCode)
      if (!asset || !asset.issuer) {
        throw new Error('Asset not found or missing issuer')
      }
      
      // For now, we'll handle the case where targetAccount is provided
      // If targetAccount isn't provided, this would be a global freeze (requiring SetOptions)
      // but for this implementation, we'll focus on per-account freezes first
      if (!targetAccount) {
        throw new Error('Target account is required for this action')
      }
      
      // Build the transaction
      const xdr = await buildTrustlineTransaction(
        publicKey,
        assetCode,
        asset.issuer,
        targetAccount,
        mode === 'unfreeze', // authorize true for unfreeze, false for freeze
        network
      )
      
      // Sign with Freighter
      const signedXdr = await signTransaction(xdr, {
        networkPassphrase: network === 'testnet' 
          ? 'Test SDF Network ; September 2015' 
          : network === 'mainnet' 
          ? 'Public Global Stellar Network ; September 2015'
          : 'Test SDF Future Network ; October 2022'
      })
      
      // Submit the transaction
      const result = await submitTransaction(signedXdr, network)
      
      // Refresh the assets list
      mutate()
      
      return {
        success: true,
        transactionHash: result.hash,
        affectedAccounts: 1,
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Action failed',
        affectedAccounts: 0,
      }
    } finally {
      setIsExecuting(false)
    }
  }, [data, isConnected, publicKey, network, mutate])

  return {
    assets: data ?? [],
    isLoading,
    error: error ?? null,
    refresh: () => mutate(),
    filterByStatus,
    currentFilter,
    executeAssetAction,
    isExecuting,
  }
}
