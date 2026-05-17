'use client'

/**
 * FreezeDialog Component
 * Dialog for initiating asset freeze operations
 */

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  LockIcon, 
  UnlockIcon, 
  AlertTriangleIcon,
  LoaderIcon,
} from 'lucide-react'
import type { Asset, FreezeResponse } from '@/lib/types'

interface FreezeDialogProps {
  asset: Asset | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (assetCode: string, reason: string, targetAccount?: string) => Promise<FreezeResponse>
  mode: 'freeze' | 'unfreeze'
}

export function FreezeDialog({ 
  asset, 
  open, 
  onOpenChange, 
  onConfirm,
  mode,
}: FreezeDialogProps) {
  const [reason, setReason] = useState('')
  const [targetAccount, setTargetAccount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<FreezeResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    if (!asset || !reason.trim()) return
    
    setIsSubmitting(true)
    setError(null)
    setResult(null)
    
    try {
      const response = await onConfirm(
        asset.code, 
        reason.trim(), 
        targetAccount.trim() || undefined
      )
      setResult(response)
      
      if (response.success) {
        // Auto-close after success
        setTimeout(() => {
          handleClose()
        }, 2000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setReason('')
    setTargetAccount('')
    setResult(null)
    setError(null)
    onOpenChange(false)
  }

  if (!asset) return null

  const isFreezing = mode === 'freeze'
  const Icon = isFreezing ? LockIcon : UnlockIcon

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={isFreezing ? 'text-critical' : 'text-safe'} />
            {isFreezing ? 'Freeze Asset' : 'Unfreeze Asset'}: {asset.code}
          </DialogTitle>
          <DialogDescription>
            {isFreezing 
              ? 'This will prevent all transfers of this asset. Existing holders will not be able to send or receive this asset.'
              : 'This will restore normal transfer capabilities for this asset.'}
          </DialogDescription>
        </DialogHeader>

        {/* Warning for freeze */}
        {isFreezing && (
          <Alert className="border-warning/50 bg-warning/10">
            <AlertTriangleIcon className="h-4 w-4 text-warning" />
            <AlertDescription className="text-warning">
              <strong>Warning:</strong> This action will affect {asset.holders.toLocaleString()} holders.
              Make sure you have proper authorization before proceeding.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {/* Target Account (optional) */}
          <div className="space-y-2">
            <Label htmlFor="targetAccount">
              Target Account (optional)
            </Label>
            <Input
              id="targetAccount"
              placeholder="G... (leave empty to affect all accounts)"
              value={targetAccount}
              onChange={(e) => setTargetAccount(e.target.value)}
              disabled={isSubmitting}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Specify a single account to {mode}, or leave empty to {mode} all accounts.
            </p>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason <span className="text-destructive">*</span>
            </Label>
            <Input
              id="reason"
              placeholder="Enter the reason for this action"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Result message */}
        {result && (
          <Alert className={result.success 
            ? 'border-safe/50 bg-safe/10' 
            : 'border-critical/50 bg-critical/10'
          }>
            <AlertDescription className={result.success ? 'text-safe' : 'text-critical'}>
              {result.success 
                ? `Successfully submitted. Affected ${result.affectedAccounts} account(s). TX: ${result.transactionHash?.slice(0, 8)}...`
                : result.error || 'Operation failed'}
            </AlertDescription>
          </Alert>
        )}

        {/* Error message */}
        {error && (
          <Alert className="border-critical/50 bg-critical/10">
            <AlertDescription className="text-critical">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant={isFreezing ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={!reason.trim() || isSubmitting}
            className={!isFreezing ? 'bg-safe hover:bg-safe/90 text-safe-foreground' : ''}
          >
            {isSubmitting ? (
              <>
                <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Icon className="h-4 w-4 mr-2" />
                Confirm {mode === 'freeze' ? 'Freeze' : 'Unfreeze'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
