/**
 * Wallet Balance API Route
 * Fetch wallet balance and account info (mock implementation)
 */

import { NextRequest, NextResponse } from 'next/server'
import type { ApiResponse } from '@/lib/types'

interface WalletInfo {
  publicKey: string
  balance: string
  sequence: string
  numSubentries: number
  lastModified: string
  trustlines: Array<{
    asset: string
    balance: string
    limit: string
  }>
}

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<WalletInfo>>> {
  const searchParams = request.nextUrl.searchParams
  const publicKey = searchParams.get('publicKey')
  
  if (!publicKey) {
    return NextResponse.json({
      success: false,
      error: 'Public key is required',
      timestamp: new Date().toISOString(),
    }, { status: 400 })
  }
  
  // Validate Stellar public key format (starts with G, 56 chars)
  if (!publicKey.startsWith('G') || publicKey.length !== 56) {
    return NextResponse.json({
      success: false,
      error: 'Invalid Stellar public key format',
      timestamp: new Date().toISOString(),
    }, { status: 400 })
  }
  
  // Mock wallet data
  const mockBalance = (Math.random() * 10000 + 100).toFixed(7)
  
  const walletInfo: WalletInfo = {
    publicKey,
    balance: mockBalance,
    sequence: (Math.floor(Math.random() * 1000000000) + 100000000000).toString(),
    numSubentries: Math.floor(Math.random() * 10) + 1,
    lastModified: new Date().toISOString(),
    trustlines: [
      {
        asset: 'USDC:GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
        balance: (Math.random() * 5000).toFixed(7),
        limit: '922337203685.4775807',
      },
      {
        asset: 'yXLM:GARDNV3Q7YGT4AKSDF25LT32YSCCW4EV22Y2TV3I2PU2MMXJTEDL5T55',
        balance: (Math.random() * 1000).toFixed(7),
        limit: '922337203685.4775807',
      },
    ],
  }
  
  return NextResponse.json({
    success: true,
    data: walletInfo,
    timestamp: new Date().toISOString(),
  })
}
