/**
 * Stellar Horizon API utilities
 */

import { StellarTomlResolver, Horizon, TransactionBuilder, Operation, Asset, Networks, xdr } from '@stellar/stellar-sdk'
import type { RiskLevel, TransactionStatus, StellarNetwork } from './types'

// Configuration
const HORIZON_URLS = {
  testnet: 'https://horizon-testnet.stellar.org',
  mainnet: 'https://horizon.stellar.org',
  futurenet: 'https://horizon-futurenet.stellar.org',
}

const NETWORK_PASSPHRASES = {
  testnet: Networks.TESTNET,
  mainnet: Networks.PUBLIC,
  futurenet: Networks.FUTURENET,
}

const NETWORK = (process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'testnet') as StellarNetwork
const HORIZON_URL = process.env.HORIZON_URL || HORIZON_URLS[NETWORK]

// Create Horizon server instance
const server = new Horizon.Server(HORIZON_URL)

/**
 * Risk assessment function for Stellar transactions
 */
export function assessRisk(amount: string, asset: string): { level: RiskLevel; score: number; reason?: string } {
  const numAmount = parseFloat(amount)
  
  if (numAmount > 1000000) {
    return { 
      level: 'critical', 
      score: 95, 
      reason: 'Unusually large transaction amount detected' 
    }
  }
  if (numAmount > 100000) {
    return { 
      level: 'high', 
      score: 75, 
      reason: 'Large transaction requiring review' 
    }
  }
  if (numAmount > 10000) {
    return { 
      level: 'medium', 
      score: 45, 
      reason: 'Moderate transaction volume' 
    }
  }
  return { level: 'low', score: 15 }
}

/**
 * Convert Horizon transaction to our Transaction type
 */
export function horizonTxToTransaction(horizonTx: any) {
  // Extract payment operation
  let source = horizonTx.source_account
  let destination = ''
  let amount = '0'
  let asset = 'XLM'
  
  if (horizonTx.operations?.records?.[0]) {
    const op = horizonTx.operations.records[0]
    if (op.type === 'payment') {
      destination = op.to
      amount = op.amount
      asset = op.asset_code || 'XLM'
    }
  }
  
  const risk = assessRisk(amount, asset)
  const status: TransactionStatus = horizonTx.successful ? 'confirmed' : 'failed'
  
  return {
    id: horizonTx.hash,
    source,
    destination,
    amount,
    asset,
    timestamp: horizonTx.created_at,
    status,
    riskLevel: risk.level,
    riskScore: risk.score,
    riskReason: risk.reason,
    ledger: horizonTx.ledger,
    fee: horizonTx.fee_charged,
  }
}

/**
 * Build a transaction to freeze/unfreeze a trustline for a specific account or asset
 */
export async function buildTrustlineTransaction(
  sourcePublicKey: string,
  assetCode: string,
  assetIssuer: string,
  targetAccount: string,
  authorize: boolean, // true to unfreeze, false to freeze
  network: StellarNetwork
) {
  const account = await server.loadAccount(sourcePublicKey)
  const asset = new Asset(assetCode, assetIssuer)
  
  const transaction = new TransactionBuilder(account, {
    fee: await server.fetchBaseFee(),
    networkPassphrase: NETWORK_PASSPHRASES[network],
  })
    .addOperation(
      Operation.allowTrust({
        trustor: targetAccount,
        asset,
        authorize: authorize,
      })
    )
    .setTimeout(30)
    .build()
  
  return transaction.toXDR()
}

/**
 * Build a transaction to set the AUTH_REVOCABLE flag on an asset issuer account
 * (Enables asset freeze/unfreeze capabilities)
 */
export async function buildSetOptionsTransaction(
  sourcePublicKey: string,
  setRevocable: boolean,
  network: StellarNetwork
) {
  const account = await server.loadAccount(sourcePublicKey)
  
  const transaction = new TransactionBuilder(account, {
    fee: await server.fetchBaseFee(),
    networkPassphrase: NETWORK_PASSPHRASES[network],
  })
    .addOperation(
      Operation.setOptions({
        setFlags: setRevocable ? xdr.AccountFlags.authRevocableFlag() : undefined,
        clearFlags: !setRevocable ? xdr.AccountFlags.authRevocableFlag() : undefined,
      })
    )
    .setTimeout(30)
    .build()
  
  return transaction.toXDR()
}

/**
 * Submit a signed transaction XDR to Horizon
 */
export async function submitTransaction(signedXdr: string, network: StellarNetwork) {
  const transaction = TransactionBuilder.fromXDR(
    signedXdr,
    NETWORK_PASSPHRASES[network]
  )
  const result = await server.submitTransaction(transaction)
  return result
}

export { server, NETWORK, HORIZON_URL, NETWORK_PASSPHRASES }
