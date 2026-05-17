'use client'

/**
 * useWallet Hook
 * Manages Stellar wallet connection via Freighter
 */

import { useState, useCallback, useEffect } from 'react'
import type { WalletState, StellarNetwork } from '@/lib/types'

// Freighter API types (scaffold for when Freighter is connected)
interface FreighterApi {
  isConnected: () => Promise<boolean>
  getPublicKey: () => Promise<string>
  getNetwork: () => Promise<string>
  signTransaction: (xdr: string, opts?: { networkPassphrase?: string }) => Promise<string>
}

declare global {
  interface Window {
    freighterApi?: FreighterApi
  }
}

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
    const checkFreighter = () => {
      const installed = typeof window !== 'undefined' && !!window.freighterApi
      setIsFreighterInstalled(installed)
    }
    
    // Check immediately and after a short delay (Freighter injects async)
    checkFreighter()
    const timeout = setTimeout(checkFreighter, 1000)
    
    return () => clearTimeout(timeout)
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
      // Check if Freighter is available
      if (!window.freighterApi) {
        // Simulate connection for demo purposes
        // In production, this would require actual Freighter installation
        const mockPublicKey = 'GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOUJ3BXFX5SLQHQR'
        const balance = await fetchBalance(mockPublicKey)
        
        setState({
          isConnected: true,
          publicKey: mockPublicKey,
          network: 'testnet',
          balance,
          isConnecting: false,
          error: null,
        })
        return
      }

      // Real Freighter connection
      const isConnected = await window.freighterApi.isConnected()
      
      if (!isConnected) {
        throw new Error('Freighter is not connected. Please unlock your wallet.')
      }

      const publicKey = await window.freighterApi.getPublicKey()
      const networkString = await window.freighterApi.getNetwork()
      
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
