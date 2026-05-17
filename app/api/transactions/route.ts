/**
 * Transactions API Route
 * Fetch paginated transaction history
 */

import { NextRequest, NextResponse } from 'next/server'
import { INITIAL_TRANSACTIONS, generateMockTransactions } from '@/lib/mock-data'
import type { ApiResponse, Transaction } from '@/lib/types'

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<{ transactions: Transaction[]; total: number; page: number; pageSize: number }>>> {
  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') || '1', 10)
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10)
  const riskFilter = searchParams.get('risk') // low, medium, high, critical
  const assetFilter = searchParams.get('asset')
  
  // Combine initial transactions with additional generated ones
  let allTransactions = [...INITIAL_TRANSACTIONS, ...generateMockTransactions(50)]
  
  // Apply filters
  if (riskFilter) {
    allTransactions = allTransactions.filter(tx => tx.riskLevel === riskFilter)
  }
  
  if (assetFilter) {
    allTransactions = allTransactions.filter(tx => tx.asset === assetFilter)
  }
  
  // Sort by timestamp (newest first)
  allTransactions.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
  
  // Paginate
  const total = allTransactions.length
  const startIndex = (page - 1) * pageSize
  const paginatedTransactions = allTransactions.slice(startIndex, startIndex + pageSize)
  
  return NextResponse.json({
    success: true,
    data: {
      transactions: paginatedTransactions,
      total,
      page,
      pageSize,
    },
    timestamp: new Date().toISOString(),
  })
}
