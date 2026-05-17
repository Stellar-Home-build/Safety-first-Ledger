/**
 * SFLM Type Definitions
 * Core types for the Stellar Freeze List Manager security dashboard
 */

/** Risk levels for transaction scoring */
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

/** Transaction status in the Stellar network */
export type TransactionStatus = 'pending' | 'confirmed' | 'failed'

/** Asset freeze status */
export type FreezeStatus = 'active' | 'frozen' | 'pending_freeze' | 'pending_unfreeze'

/** Stellar network types */
export type StellarNetwork = 'mainnet' | 'testnet' | 'futurenet'

/**
 * Represents a Stellar transaction with risk assessment
 */
export interface Transaction {
  /** Unique transaction hash */
  id: string
  /** Source account public key */
  source: string
  /** Destination account public key */
  destination: string
  /** Amount in stroops (1 XLM = 10,000,000 stroops) */
  amount: string
  /** Asset code (native = XLM) */
  asset: string
  /** ISO timestamp of the transaction */
  timestamp: string
  /** Current transaction status */
  status: TransactionStatus
  /** Risk assessment level */
  riskLevel: RiskLevel
  /** Risk score from 0-100 */
  riskScore: number
  /** Human-readable risk explanation */
  riskReason?: string
  /** Transaction memo (optional) */
  memo?: string
  /** Ledger sequence number */
  ledger?: number
  /** Transaction fee in stroops */
  fee?: string
}

/**
 * Represents a managed asset in the inventory
 */
export interface Asset {
  /** Asset code (e.g., 'USDC', 'XLM') */
  code: string
  /** Asset issuer public key (null for native XLM) */
  issuer: string | null
  /** Current freeze status */
  status: FreezeStatus
  /** Total supply of the asset */
  totalSupply: string
  /** Number of accounts holding the asset */
  holders: number
  /** Number of frozen accounts for this asset */
  frozenAccounts: number
  /** ISO timestamp of last status change */
  lastUpdated: string
  /** Asset description */
  description?: string
  /** Asset home domain */
  homeDomain?: string
}

/**
 * Wallet connection state
 */
export interface WalletState {
  /** Whether a wallet is connected */
  isConnected: boolean
  /** Connected public key */
  publicKey: string | null
  /** Current network */
  network: StellarNetwork
  /** Wallet balance in XLM */
  balance: string | null
  /** Whether connection is in progress */
  isConnecting: boolean
  /** Connection error message */
  error: string | null
}

/**
 * Security alert for the dashboard
 */
export interface SecurityAlert {
  /** Unique alert ID */
  id: string
  /** Alert severity level */
  severity: RiskLevel
  /** Alert title */
  title: string
  /** Alert description */
  message: string
  /** ISO timestamp when alert was created */
  timestamp: string
  /** Whether alert has been acknowledged */
  acknowledged: boolean
  /** Related transaction ID if applicable */
  transactionId?: string
  /** Related asset code if applicable */
  assetCode?: string
}

/**
 * Dashboard statistics
 */
export interface DashboardStats {
  /** Total transactions monitored in last 24h */
  totalTransactions24h: number
  /** Number of flagged transactions */
  flaggedTransactions: number
  /** Total value monitored in XLM */
  totalValueMonitored: string
  /** Number of active alerts */
  activeAlerts: number
  /** Number of frozen accounts */
  frozenAccounts: number
  /** Network status */
  networkStatus: 'healthy' | 'degraded' | 'down'
  /** Last sync timestamp */
  lastSync: string
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

/**
 * Transaction stream event
 */
export interface TransactionStreamEvent {
  type: 'transaction' | 'alert' | 'stats_update'
  payload: Transaction | SecurityAlert | Partial<DashboardStats>
  timestamp: string
}

/**
 * Freeze request payload
 */
export interface FreezeRequest {
  /** Asset code to freeze */
  assetCode: string
  /** Target account to freeze (optional - freezes all if not specified) */
  targetAccount?: string
  /** Reason for freeze */
  reason: string
  /** Expiration timestamp (optional) */
  expiresAt?: string
}

/**
 * Freeze response
 */
export interface FreezeResponse {
  success: boolean
  transactionHash?: string
  error?: string
  affectedAccounts: number
}
