'use client'

/**
 * TransactionTable Component
 * Displays real-time transactions with risk scoring
 */

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  ExternalLinkIcon, 
  CopyIcon, 
  CheckIcon,
  ArrowUpRightIcon,
  ArrowDownLeftIcon,
} from 'lucide-react'
import type { Transaction, RiskLevel } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface TransactionTableProps {
  transactions: Transaction[]
  maxRows?: number
  showPagination?: boolean
  walletAddress?: string | null
}

function formatAddress(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

function formatAmount(amount: string, asset: string): string {
  const num = parseFloat(amount)
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M ${asset}`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(2)}K ${asset}`
  }
  return `${num.toLocaleString()} ${asset}`
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  
  if (diffSecs < 60) return `${diffSecs}s ago`
  
  const diffMins = Math.floor(diffSecs / 60)
  if (diffMins < 60) return `${diffMins}m ago`
  
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  
  return date.toLocaleDateString()
}

function getRiskBadgeStyles(level: RiskLevel): string {
  switch (level) {
    case 'critical':
      return 'bg-critical/20 text-critical border-critical/30'
    case 'high':
      return 'bg-warning/20 text-warning border-warning/30'
    case 'medium':
      return 'bg-primary/20 text-primary border-primary/30'
    default:
      return 'bg-safe/20 text-safe border-safe/30'
  }
}

function getRiskScoreColor(score: number): string {
  if (score >= 75) return 'text-critical'
  if (score >= 50) return 'text-warning'
  if (score >= 25) return 'text-primary'
  return 'text-safe'
}

export function TransactionTable({ 
  transactions, 
  maxRows = 10,
  showPagination = false,
  walletAddress,
}: TransactionTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  
  const displayedTransactions = showPagination 
    ? transactions.slice(page * maxRows, (page + 1) * maxRows)
    : transactions.slice(0, maxRows)
  
  const totalPages = Math.ceil(transactions.length / maxRows)

  const copyTransactionId = async (id: string) => {
    await navigator.clipboard.writeText(id)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const isOutgoing = (tx: Transaction) => {
    return walletAddress && tx.source === walletAddress
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p>No transactions yet</p>
        <p className="text-sm">Transactions will appear here in real-time</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[100px]">Time</TableHead>
            <TableHead>Transaction</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead className="text-center">Risk</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayedTransactions.map((tx) => (
            <TableRow 
              key={tx.id}
              className={cn(
                'transition-colors',
                tx.riskLevel === 'critical' && 'bg-critical/5 hover:bg-critical/10',
                tx.riskLevel === 'high' && 'bg-warning/5 hover:bg-warning/10',
              )}
            >
              <TableCell className="font-mono text-xs text-muted-foreground">
                {formatTimestamp(tx.timestamp)}
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    {walletAddress ? (
                      isOutgoing(tx) ? (
                        <ArrowUpRightIcon className="h-4 w-4 text-destructive" />
                      ) : (
                        <ArrowDownLeftIcon className="h-4 w-4 text-safe" />
                      )
                    ) : null}
                    <span className="font-mono text-sm">
                      {formatAddress(tx.source)}
                    </span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-mono text-sm">
                      {formatAddress(tx.destination)}
                    </span>
                  </div>
                  {tx.riskReason && (
                    <span className="text-xs text-muted-foreground line-clamp-1">
                      {tx.riskReason}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span className="font-medium">
                  {formatAmount(tx.amount, tx.asset)}
                </span>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex flex-col items-center gap-1">
                  <Badge 
                    variant="outline" 
                    className={cn('capitalize', getRiskBadgeStyles(tx.riskLevel))}
                  >
                    {tx.riskLevel}
                  </Badge>
                  <span className={cn('text-xs font-mono', getRiskScoreColor(tx.riskScore))}>
                    {tx.riskScore}%
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => copyTransactionId(tx.id)}
                  >
                    {copiedId === tx.id ? (
                      <CheckIcon className="h-4 w-4 text-safe" />
                    ) : (
                      <CopyIcon className="h-4 w-4" />
                    )}
                    <span className="sr-only">Copy transaction ID</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    asChild
                  >
                    <a 
                      href={`https://stellar.expert/explorer/testnet/tx/${tx.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLinkIcon className="h-4 w-4" />
                      <span className="sr-only">View on explorer</span>
                    </a>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {page * maxRows + 1}-{Math.min((page + 1) * maxRows, transactions.length)} of {transactions.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
