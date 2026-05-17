/**
 * Assets Inventory API Route
 * Fetch managed assets and their freeze status
 */

import { NextRequest, NextResponse } from 'next/server'
import { MOCK_ASSETS_INVENTORY } from '@/lib/mock-data'
import type { ApiResponse, Asset, FreezeRequest, FreezeResponse } from '@/lib/types'

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<{ assets: Asset[] }>>> {
  const searchParams = request.nextUrl.searchParams
  const statusFilter = searchParams.get('status') // active, frozen, pending_freeze, pending_unfreeze
  
  let assets = [...MOCK_ASSETS_INVENTORY]
  
  if (statusFilter) {
    assets = assets.filter(asset => asset.status === statusFilter)
  }
  
  // Sort by holders count (most popular first)
  assets.sort((a, b) => b.holders - a.holders)
  
  return NextResponse.json({
    success: true,
    data: { assets },
    timestamp: new Date().toISOString(),
  })
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<FreezeResponse>>> {
  try {
    const body = await request.json() as FreezeRequest
    
    if (!body.assetCode || !body.reason) {
      return NextResponse.json({
        success: false,
        error: 'Asset code and reason are required',
        timestamp: new Date().toISOString(),
      }, { status: 400 })
    }
    
    // Find the asset
    const asset = MOCK_ASSETS_INVENTORY.find(a => a.code === body.assetCode)
    
    if (!asset) {
      return NextResponse.json({
        success: false,
        error: `Asset ${body.assetCode} not found`,
        timestamp: new Date().toISOString(),
      }, { status: 404 })
    }
    
    // Simulate freeze operation
    // In a real implementation, this would submit a transaction to the Stellar network
    const mockTxHash = Array.from({ length: 64 }, () => 
      '0123456789abcdef'[Math.floor(Math.random() * 16)]
    ).join('')
    
    const affectedAccounts = body.targetAccount ? 1 : asset.holders
    
    return NextResponse.json({
      success: true,
      data: {
        success: true,
        transactionHash: mockTxHash,
        affectedAccounts,
      },
      timestamp: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Invalid request body',
      timestamp: new Date().toISOString(),
    }, { status: 400 })
  }
}
