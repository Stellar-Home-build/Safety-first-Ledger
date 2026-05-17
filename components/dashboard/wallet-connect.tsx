'use client'

/**
 * WalletConnect Component
 * Button to connect/disconnect Stellar wallet via Freighter
 */

import { useWallet } from '@/hooks/use-wallet'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { WalletIcon, LogOutIcon, RefreshCwIcon, CopyIcon, CheckIcon } from 'lucide-react'
import { useState } from 'react'

function formatPublicKey(key: string): string {
  return `${key.slice(0, 4)}...${key.slice(-4)}`
}

function formatBalance(balance: string): string {
  const num = parseFloat(balance)
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(2)}K`
  }
  return num.toFixed(2)
}

export function WalletConnect() {
  const { 
    isConnected, 
    publicKey, 
    balance, 
    network,
    isConnecting, 
    error,
    connect, 
    disconnect,
    refreshBalance,
    isFreighterInstalled,
  } = useWallet()
  
  const [copied, setCopied] = useState(false)

  const copyAddress = async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-end gap-1">
        <Button
          onClick={connect}
          disabled={isConnecting}
          variant="outline"
          className="border-primary/30 hover:border-primary hover:bg-primary/10"
        >
          <WalletIcon className="mr-2 h-4 w-4" />
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
        {!isFreighterInstalled && (
          <span className="text-xs text-muted-foreground">
            Demo mode (Freighter not detected)
          </span>
        )}
        {error && (
          <span className="text-xs text-destructive">{error}</span>
        )}
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="border-safe/30 hover:border-safe">
          <span className="mr-2 h-2 w-2 rounded-full bg-safe animate-pulse-safe" />
          <span className="font-mono">{formatPublicKey(publicKey!)}</span>
          {balance && (
            <span className="ml-2 text-muted-foreground">
              {formatBalance(balance)} XLM
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Connected Wallet</span>
          <span className="font-mono text-xs break-all">{publicKey}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-muted-foreground">
          <span className="flex items-center gap-2">
            Network: <span className="capitalize text-foreground">{network}</span>
          </span>
        </DropdownMenuItem>
        {balance && (
          <DropdownMenuItem className="text-muted-foreground">
            <span className="flex items-center gap-2">
              Balance: <span className="text-foreground">{parseFloat(balance).toFixed(4)} XLM</span>
            </span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={copyAddress}>
          {copied ? (
            <CheckIcon className="mr-2 h-4 w-4 text-safe" />
          ) : (
            <CopyIcon className="mr-2 h-4 w-4" />
          )}
          {copied ? 'Copied!' : 'Copy Address'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={refreshBalance}>
          <RefreshCwIcon className="mr-2 h-4 w-4" />
          Refresh Balance
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={disconnect} className="text-destructive focus:text-destructive">
          <LogOutIcon className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
