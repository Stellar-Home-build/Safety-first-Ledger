'use client'

/**
 * InventoryPage Component
 * Asset inventory management with freeze/unfreeze capabilities
 */

import { useState, useCallback } from 'react'
import { useAssets } from '@/hooks/use-assets'
import { useTransactionStream } from '@/hooks/use-transaction-stream'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { AssetTable } from './asset-table'
import { FreezeDialog } from './freeze-dialog'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  RefreshCwIcon, 
  FilterIcon,
  LockIcon,
  UnlockIcon,
  PackageIcon,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Asset, FreezeStatus } from '@/lib/types'

const statusFilters: Array<{ value: FreezeStatus | null; label: string }> = [
  { value: null, label: 'All Assets' },
  { value: 'active', label: 'Active' },
  { value: 'frozen', label: 'Frozen' },
  { value: 'pending_freeze', label: 'Pending Freeze' },
  { value: 'pending_unfreeze', label: 'Pending Unfreeze' },
]

export function InventoryPage() {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [dialogMode, setDialogMode] = useState<'freeze' | 'unfreeze'>('freeze')
  const [dialogOpen, setDialogOpen] = useState(false)

  const { isConnected, error } = useTransactionStream({ autoConnect: true })
  
  const { 
    assets, 
    isLoading, 
    refresh, 
    filterByStatus, 
    currentFilter,
    executeAssetAction,
    isExecuting,
  } = useAssets()

  const handleFreezeClick = useCallback((asset: Asset) => {
    setSelectedAsset(asset)
    setDialogMode('freeze')
    setDialogOpen(true)
  }, [])

  const handleUnfreezeClick = useCallback((asset: Asset) => {
    setSelectedAsset(asset)
    setDialogMode('unfreeze')
    setDialogOpen(true)
  }, [])

  const handleConfirmAction = useCallback(async (
    assetCode: string,
    reason: string,
    mode: 'freeze' | 'unfreeze',
    targetAccount?: string
  ) => {
    return executeAssetAction(assetCode, reason, mode, targetAccount)
  }, [executeAssetAction])

  // Calculate summary stats
  const totalAssets = assets.length
  const activeAssets = assets.filter(a => a.status === 'active').length
  const frozenAssets = assets.filter(a => a.status === 'frozen').length
  const pendingAssets = assets.filter(a => 
    a.status === 'pending_freeze' || a.status === 'pending_unfreeze'
  ).length

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader isConnected={isConnected} error={error} />
      
      <main className="flex-1 container py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Assets
              </CardTitle>
              <PackageIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAssets}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active
              </CardTitle>
              <UnlockIcon className="h-4 w-4 text-safe" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-safe">{activeAssets}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Frozen
              </CardTitle>
              <LockIcon className="h-4 w-4 text-critical" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-critical">{frozenAssets}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending
              </CardTitle>
              <FilterIcon className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{pendingAssets}</div>
            </CardContent>
          </Card>
        </div>

        {/* Asset Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Asset Inventory</CardTitle>
              <CardDescription>
                Manage your Stellar assets and freeze status
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <FilterIcon className="h-4 w-4 mr-2" />
                    {statusFilters.find(f => f.value === currentFilter)?.label || 'Filter'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {statusFilters.map((filter) => (
                    <DropdownMenuItem
                      key={filter.value ?? 'all'}
                      onClick={() => filterByStatus(filter.value)}
                      className={currentFilter === filter.value ? 'bg-accent' : ''}
                    >
                      {filter.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                disabled={isLoading}
              >
                <RefreshCwIcon className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <AssetTable 
              assets={assets}
              onFreezeClick={handleFreezeClick}
              onUnfreezeClick={handleUnfreezeClick}
              isLoading={isLoading || isExecuting}
            />
          </CardContent>
        </Card>
      </main>

      {/* Freeze/Unfreeze Dialog */}
      <FreezeDialog
        asset={selectedAsset}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={handleConfirmAction}
        mode={dialogMode}
      />

      {/* Footer */}
      <footer className="border-t border-border/50 py-4">
        <div className="container flex items-center justify-between text-sm text-muted-foreground">
          <span>SFLM Security Dashboard v1.0.0</span>
          <span>Connected to Stellar Testnet</span>
        </div>
      </footer>
    </div>
  )
}
