'use client'

/**
 * AssetTable Component
 * Displays managed assets with their freeze status
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
  LockIcon, 
  UnlockIcon, 
  ExternalLinkIcon,
  UsersIcon,
  AlertTriangleIcon,
} from 'lucide-react'
import type { Asset, FreezeStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

interface AssetTableProps {
  assets: Asset[]
  onFreezeClick: (asset: Asset) => void
  onUnfreezeClick: (asset: Asset) => void
  isLoading?: boolean
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toLocaleString()
}

function formatSupply(supply: string): string {
  const num = parseFloat(supply)
  return formatNumber(num)
}

function getStatusBadgeStyles(status: FreezeStatus): string {
  switch (status) {
    case 'frozen':
      return 'bg-critical/20 text-critical border-critical/30'
    case 'pending_freeze':
      return 'bg-warning/20 text-warning border-warning/30'
    case 'pending_unfreeze':
      return 'bg-primary/20 text-primary border-primary/30'
    default:
      return 'bg-safe/20 text-safe border-safe/30'
  }
}

function getStatusLabel(status: FreezeStatus): string {
  switch (status) {
    case 'frozen':
      return 'Frozen'
    case 'pending_freeze':
      return 'Pending Freeze'
    case 'pending_unfreeze':
      return 'Pending Unfreeze'
    default:
      return 'Active'
  }
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function AssetTable({ 
  assets, 
  onFreezeClick, 
  onUnfreezeClick,
  isLoading,
}: AssetTableProps) {
  if (assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p>No assets found</p>
        <p className="text-sm">Managed assets will appear here</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Asset</TableHead>
          <TableHead>Total Supply</TableHead>
          <TableHead className="text-center">Holders</TableHead>
          <TableHead className="text-center">Status</TableHead>
          <TableHead className="text-center">Frozen Accounts</TableHead>
          <TableHead>Last Updated</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {assets.map((asset) => (
          <TableRow 
            key={`${asset.code}-${asset.issuer}`}
            className={cn(
              'transition-colors',
              isLoading && 'animate-pulse',
              asset.status === 'frozen' && 'bg-critical/5',
              asset.status === 'pending_freeze' && 'bg-warning/5',
            )}
          >
            <TableCell>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">{asset.code}</span>
                  {asset.status === 'frozen' && (
                    <LockIcon className="h-4 w-4 text-critical" />
                  )}
                </div>
                {asset.description && (
                  <span className="text-xs text-muted-foreground">
                    {asset.description}
                  </span>
                )}
                {asset.homeDomain && (
                  <a 
                    href={`https://${asset.homeDomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    {asset.homeDomain}
                    <ExternalLinkIcon className="h-3 w-3" />
                  </a>
                )}
              </div>
            </TableCell>
            <TableCell>
              <span className="font-mono">
                {formatSupply(asset.totalSupply)}
              </span>
            </TableCell>
            <TableCell className="text-center">
              <div className="flex items-center justify-center gap-1">
                <UsersIcon className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono">{formatNumber(asset.holders)}</span>
              </div>
            </TableCell>
            <TableCell className="text-center">
              <Badge 
                variant="outline" 
                className={getStatusBadgeStyles(asset.status)}
              >
                {getStatusLabel(asset.status)}
              </Badge>
            </TableCell>
            <TableCell className="text-center">
              {asset.frozenAccounts > 0 ? (
                <div className="flex items-center justify-center gap-1">
                  <AlertTriangleIcon className="h-4 w-4 text-warning" />
                  <span className="font-mono text-warning">
                    {formatNumber(asset.frozenAccounts)}
                  </span>
                </div>
              ) : (
                <span className="text-muted-foreground">0</span>
              )}
            </TableCell>
            <TableCell>
              <span className="text-sm text-muted-foreground">
                {formatTimestamp(asset.lastUpdated)}
              </span>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-2">
                {asset.status === 'active' || asset.status === 'pending_unfreeze' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-critical/30 text-critical hover:bg-critical/10 hover:border-critical"
                    onClick={() => onFreezeClick(asset)}
                  >
                    <LockIcon className="h-4 w-4 mr-1" />
                    Freeze
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-safe/30 text-safe hover:bg-safe/10 hover:border-safe"
                    onClick={() => onUnfreezeClick(asset)}
                  >
                    <UnlockIcon className="h-4 w-4 mr-1" />
                    Unfreeze
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
