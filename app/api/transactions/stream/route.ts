/**
 * Transaction Stream API Route
 * Server-Sent Events (SSE) endpoint for real-time transaction monitoring
 */

import { server, horizonTxToTransaction } from '@/lib/stellar'
import type { TransactionStreamEvent, SecurityAlert, DashboardStats } from '@/lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(): Promise<Response> {
  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const connectEvent: TransactionStreamEvent = {
        type: 'stats_update',
        payload: { networkStatus: 'healthy' },
        timestamp: new Date().toISOString(),
      }
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify(connectEvent)}\n\n`)
      )
      
      // Track reconnection attempts
      let reconnectAttempts = 0
      const MAX_RECONNECT_ATTEMPTS = 10
      const RECONNECT_DELAY_BASE = 1000 // 1 second
      
      const connectToHorizon = () => {
        try {
          // Create transaction stream from Horizon
          const txStream = server.transactions()
            .cursor('now')
            .stream({
              onmessage: async (horizonTx) => {
                try {
                  reconnectAttempts = 0
                  
                  // Fetch operations for this transaction
                  const ops = await server.operations().forTransaction(horizonTx.hash).call()
                  const txWithOps = { ...horizonTx, operations: ops }
                  
                  // Convert to our transaction type
                  const transaction = horizonTxToTransaction(txWithOps)
                  
                  const event: TransactionStreamEvent = {
                    type: 'transaction',
                    payload: transaction,
                    timestamp: new Date().toISOString(),
                  }
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
                  )
                  
                  // Send alert for high-risk transactions
                  if (transaction.riskLevel === 'critical' || transaction.riskLevel === 'high') {
                    const alert: SecurityAlert = {
                      id: `alert-${Date.now()}`,
                      severity: transaction.riskLevel,
                      title: transaction.riskReason || 'Suspicious Transaction Detected',
                      message: `A ${transaction.riskLevel} risk transaction was detected involving ${transaction.amount} ${transaction.asset}`,
                      timestamp: new Date().toISOString(),
                      acknowledged: false,
                      transactionId: transaction.id,
                      assetCode: transaction.asset,
                    }
                    
                    const alertEvent: TransactionStreamEvent = {
                      type: 'alert',
                      payload: alert,
                      timestamp: new Date().toISOString(),
                    }
                    
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify(alertEvent)}\n\n`)
                    )
                  }
                } catch (err) {
                  console.error('Error processing transaction:', err)
                }
              },
              onerror: (error) => {
                console.error('Horizon stream error:', error)
                
                // Attempt to reconnect
                if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                  reconnectAttempts++
                  const delay = RECONNECT_DELAY_BASE * Math.pow(2, reconnectAttempts - 1)
                  console.log(`Reconnecting to Horizon in ${delay}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`)
                  
                  const statsEvent: TransactionStreamEvent = {
                    type: 'stats_update',
                    payload: { networkStatus: 'degraded' } as Partial<DashboardStats>,
                    timestamp: new Date().toISOString(),
                  }
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify(statsEvent)}\n\n`)
                  )
                  
                  setTimeout(connectToHorizon, delay)
                } else {
                  console.error('Max reconnect attempts reached')
                  const statsEvent: TransactionStreamEvent = {
                    type: 'stats_update',
                    payload: { networkStatus: 'down' } as Partial<DashboardStats>,
                    timestamp: new Date().toISOString(),
                  }
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify(statsEvent)}\n\n`)
                  )
                }
              }
            })
          
          // Cleanup function
          controller.close = () => {
            txStream() // Close the Horizon stream
          }
        } catch (err) {
          console.error('Failed to connect to Horizon:', err)
        }
      }
      
      // Start Horizon connection
      connectToHorizon()
    },
  })
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
