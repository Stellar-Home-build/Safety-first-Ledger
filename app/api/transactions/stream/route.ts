/**
 * Transaction Stream API Route
 * Server-Sent Events (SSE) endpoint for real-time transaction monitoring
 */

import { simulateNewTransaction, generateMockAlert } from '@/lib/mock-data'
import type { TransactionStreamEvent } from '@/lib/types'

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
      
      // Simulate real-time transactions at random intervals
      const sendTransaction = () => {
        try {
          const transaction = simulateNewTransaction()
          const event: TransactionStreamEvent = {
            type: 'transaction',
            payload: transaction,
            timestamp: new Date().toISOString(),
          }
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
          )
          
          // Occasionally send alerts for high-risk transactions
          if (transaction.riskLevel === 'critical' || transaction.riskLevel === 'high') {
            const alert = generateMockAlert()
            alert.transactionId = transaction.id
            alert.severity = transaction.riskLevel
            
            const alertEvent: TransactionStreamEvent = {
              type: 'alert',
              payload: alert,
              timestamp: new Date().toISOString(),
            }
            
            setTimeout(() => {
              try {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify(alertEvent)}\n\n`)
                )
              } catch {
                // Stream may be closed
              }
            }, 500)
          }
        } catch {
          // Stream closed, stop sending
          return
        }
        
        // Schedule next transaction (random interval between 2-8 seconds)
        const nextInterval = Math.floor(Math.random() * 6000) + 2000
        setTimeout(sendTransaction, nextInterval)
      }
      
      // Start sending transactions after a short delay
      setTimeout(sendTransaction, 1000)
      
      // Send periodic stats updates
      const statsInterval = setInterval(() => {
        try {
          const statsEvent: TransactionStreamEvent = {
            type: 'stats_update',
            payload: {
              totalTransactions24h: Math.floor(Math.random() * 1000) + 15000,
              flaggedTransactions: Math.floor(Math.random() * 10) + 20,
              lastSync: new Date().toISOString(),
            },
            timestamp: new Date().toISOString(),
          }
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(statsEvent)}\n\n`)
          )
        } catch {
          clearInterval(statsInterval)
        }
      }, 30000) // Every 30 seconds
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
