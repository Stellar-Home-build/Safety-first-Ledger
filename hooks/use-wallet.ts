'use client'

/**
 * useWallet Hook
 * Manages Stellar wallet connection via Freighter
 */

import { useState, useCallback, useEffect } from 'react'
import { isConnected, getPublicKey, getNetwork } from '@stellar/freighter-api'
import type { WalletState, StellarNetwork } from '@/lib/types'

interface UseWalletReturn extends WalletState {
  /** Connect to Freighter wallet */
  connect: () => Promise<void>
  /** Disconnect wallet */
  disconnect: () => void
  /** Refresh wallet balance */
  refreshBalance: () => Promise<void>
  /** Check if Freighter is installed */
  isFreighterInstalled: boolean
}

export function useWallet(): UseWalletReturn {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    publicKey: null,
    network: 'testnet',
    balance: null,
    isConnecting: false,
    error: null,
  })
  
  const [isFreighterInstalled, setIsFreighterInstalled] = useState(false)

  // Check if Freighter is installed
  useEffect(() => {
    const checkFreighter = async () => {
      try {
        const installed = await isConnected()
        setIsFreighterInstalled(true)
      } catch {
        setIsFreighterInstalled(false)
      }
    }
    
    // Check immediately
    if (typeof window !== 'undefined') {
      checkFreighter()
    }
  }, [])

  const fetchBalance = useCallback(async (publicKey: string): Promise<string | null> => {
    try {
      const response = await fetch(`/api/wallet?publicKey=${publicKey}`)
      const data = await response.json()
      
      if (data.success && data.data) {
        return data.data.balance
      }
      return null
    } catch {
      return null
    }
  }, [])

  const connect = useCallback(async () => {
    setState((prev) => ({ ...prev, isConnecting: true, error: null }))

    try {
      const isFreighterConnected = await isConnected()
      
      if (!isFreighterConnected) {
        throw new Error('Freighter is not connected. Please unlock your wallet.')
      }

      const publicKey = await getPublicKey()
      const networkString = await getNetwork()
      
      // Map network string to our type
      let network: StellarNetwork = 'testnet'
      if (networkString.toLowerCase().includes('public') || networkString.toLowerCase().includes('mainnet')) {
        network = 'mainnet'
      } else if (networkString.toLowerCase().includes('futurenet')) {
        network = 'futurenet'
      }

      const balance = await fetchBalance(publicKey)

      setState({
        isConnected: true,
        publicKey,
        network,
        balance,
        isConnecting: false,
        error: null,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to connect wallet'
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: message,
      }))
    }
  }, [fetchBalance])

  const disconnect = useCallback(() => {
    setState({
      isConnected: false,
      publicKey: null,
      network: 'testnet',
      balance: null,
      isConnecting: false,
      error: null,
    })
  }, [])

  const refreshBalance = useCallback(async () => {
    if (!state.publicKey) return

    const balance = await fetchBalance(state.publicKey)
    if (balance !== null) {
      setState((prev) => ({ ...prev, balance }))
    }
  }, [state.publicKey, fetchBalance])

  return {
    ...state,
    connect,
    disconnect,
    refreshBalance,
    isFreighterInstalled,
  }
}
