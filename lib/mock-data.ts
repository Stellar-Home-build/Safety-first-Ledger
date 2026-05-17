/**
 * SFLM Mock Data
 * Simulated Stellar blockchain data for development and testing
 */

import type { 
  Transaction, 
  Asset, 
  SecurityAlert, 
  DashboardStats,
  RiskLevel 
} from './types'

/** Generate a mock Stellar public key */
function generateMockPublicKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let key = 'G'
  for (let i = 0; i < 55; i++) {
    key += chars[Math.floor(Math.random() * chars.length)]
  }
  return key
}

/** Generate a mock transaction hash */
function generateMockHash(): string {
  const chars = '0123456789abcdef'
  let hash = ''
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)]
  }
  return hash
}

/** Risk assessment based on amount and patterns */
function assessRisk(amount: number): { level: RiskLevel; score: number; reason?: string } {
  if (amount > 1000000) {
    return { 
      level: 'critical', 
      score: 95, 
      reason: 'Unusually large transaction amount detected' 
    }
  }
  if (amount > 100000) {
    return { 
      level: 'high', 
      score: 75, 
      reason: 'Large transaction requiring review' 
    }
  }
  if (amount > 10000) {
    return { 
      level: 'medium', 
      score: 45, 
      reason: 'Moderate transaction volume' 
    }
  }
  return { level: 'low', score: 15 }
}

/** Mock asset codes with realistic names */
const MOCK_ASSETS = ['XLM', 'USDC', 'yXLM', 'AQUA', 'SHX', 'FIDR', 'LSP']

/** Generate a single mock transaction */
export function generateMockTransaction(overrides?: Partial<Transaction>): Transaction {
  const amount = Math.floor(Math.random() * 500000) + 100
  const risk = assessRisk(amount)
  const timestamp = new Date(Date.now() - Math.floor(Math.random() * 3600000)).toISOString()
  
  return {
    id: generateMockHash(),
    source: generateMockPublicKey(),
    destination: generateMockPublicKey(),
    amount: amount.toString(),
    asset: MOCK_ASSETS[Math.floor(Math.random() * MOCK_ASSETS.length)],
    timestamp,
    status: Math.random() > 0.1 ? 'confirmed' : 'pending',
    riskLevel: risk.level,
    riskScore: risk.score,
    riskReason: risk.reason,
    ledger: Math.floor(Math.random() * 1000000) + 50000000,
    fee: (Math.floor(Math.random() * 1000) + 100).toString(),
    ...overrides,
  }
}

/** Generate multiple mock transactions */
export function generateMockTransactions(count: number): Transaction[] {
  return Array.from({ length: count }, () => generateMockTransaction())
}

/** Initial mock transactions for the dashboard */
export const INITIAL_TRANSACTIONS: Transaction[] = [
  generateMockTransaction({ 
    amount: '1500000', 
    asset: 'USDC',
    riskLevel: 'critical',
    riskScore: 92,
    riskReason: 'Unusually large USDC transfer from new account'
  }),
  generateMockTransaction({ 
    amount: '250000', 
    asset: 'XLM',
    riskLevel: 'high',
    riskScore: 78,
    riskReason: 'Multiple rapid transactions detected'
  }),
  generateMockTransaction({ 
    amount: '50000', 
    asset: 'yXLM',
    riskLevel: 'medium',
    riskScore: 52,
    riskReason: 'Transaction to previously flagged address'
  }),
  ...generateMockTransactions(7),
]

/** Mock managed assets */
export const MOCK_ASSETS_INVENTORY: Asset[] = [
  {
    code: 'USDC',
    issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
    status: 'active',
    totalSupply: '150000000',
    holders: 45230,
    frozenAccounts: 12,
    lastUpdated: new Date().toISOString(),
    description: 'USD Coin - Stellar anchor',
    homeDomain: 'centre.io',
  },
  {
    code: 'yXLM',
    issuer: 'GARDNV3Q7YGT4AKSDF25LT32YSCCW4EV22Y2TV3I2PU2MMXJTEDL5T55',
    status: 'active',
    totalSupply: '89000000',
    holders: 28450,
    frozenAccounts: 3,
    lastUpdated: new Date().toISOString(),
    description: 'Yield-bearing XLM',
    homeDomain: 'ultrastellar.com',
  },
  {
    code: 'AQUA',
    issuer: 'GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA',
    status: 'active',
    totalSupply: '10000000000',
    holders: 156000,
    frozenAccounts: 45,
    lastUpdated: new Date().toISOString(),
    description: 'Aquarius governance token',
    homeDomain: 'aqua.network',
  },
  {
    code: 'SHX',
    issuer: 'GDSTRSHXHGJ7ZIVRBXEYE5Q74XUVCUSEZ7RKQWDVG7Z3KSSS5X7KRYRZ',
    status: 'frozen',
    totalSupply: '500000000',
    holders: 12000,
    frozenAccounts: 12000,
    lastUpdated: new Date(Date.now() - 86400000).toISOString(),
    description: 'Stronghold token - FROZEN',
    homeDomain: 'stronghold.co',
  },
  {
    code: 'FIDR',
    issuer: 'GBZH7S5NC57XNHKHJ75C5DGMI3SP6ZFJLIKW74K6OSMA5E5DFMYBDD2V',
    status: 'pending_freeze',
    totalSupply: '25000000',
    holders: 8900,
    frozenAccounts: 0,
    lastUpdated: new Date().toISOString(),
    description: 'Fidor Bank token',
    homeDomain: 'fidor.de',
  },
]

/** Mock security alerts */
export const MOCK_ALERTS: SecurityAlert[] = [
  {
    id: 'alert-001',
    severity: 'critical',
    title: 'Suspicious Large Transfer Detected',
    message: 'A transfer of 1,500,000 USDC was detected from a newly created account. This transaction matches patterns associated with previous security incidents.',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    acknowledged: false,
    transactionId: INITIAL_TRANSACTIONS[0].id,
    assetCode: 'USDC',
  },
  {
    id: 'alert-002',
    severity: 'high',
    title: 'Rapid Transaction Pattern',
    message: 'Multiple transactions (>10) detected from the same source within a 5-minute window. Possible automated activity.',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    acknowledged: false,
    transactionId: INITIAL_TRANSACTIONS[1].id,
  },
  {
    id: 'alert-003',
    severity: 'medium',
    title: 'Flagged Address Interaction',
    message: 'Transaction detected to an address that was previously flagged for suspicious activity.',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    acknowledged: true,
    transactionId: INITIAL_TRANSACTIONS[2].id,
  },
  {
    id: 'alert-004',
    severity: 'low',
    title: 'New Asset Trust Line',
    message: 'A monitored account has established a trust line with a new, unverified asset.',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    acknowledged: true,
  },
]

/** Mock dashboard statistics */
export const MOCK_DASHBOARD_STATS: DashboardStats = {
  totalTransactions24h: 15420,
  flaggedTransactions: 23,
  totalValueMonitored: '45678901',
  activeAlerts: MOCK_ALERTS.filter(a => !a.acknowledged).length,
  frozenAccounts: 60,
  networkStatus: 'healthy',
  lastSync: new Date().toISOString(),
}

/** Simulate a new incoming transaction (for real-time updates) */
export function simulateNewTransaction(): Transaction {
  const isSuspicious = Math.random() > 0.85
  
  if (isSuspicious) {
    const suspiciousTypes = [
      { amount: '750000', riskLevel: 'critical' as RiskLevel, riskScore: 88, riskReason: 'Rapid fund movement pattern detected' },
      { amount: '320000', riskLevel: 'high' as RiskLevel, riskScore: 72, riskReason: 'Transaction to known mixer address' },
      { amount: '180000', riskLevel: 'high' as RiskLevel, riskScore: 68, riskReason: 'Unusual transaction timing' },
    ]
    const type = suspiciousTypes[Math.floor(Math.random() * suspiciousTypes.length)]
    return generateMockTransaction(type)
  }
  
  return generateMockTransaction()
}

/** Generate a new mock alert */
export function generateMockAlert(): SecurityAlert {
  const severities: RiskLevel[] = ['low', 'medium', 'high', 'critical']
  const templates = [
    { title: 'Unusual Volume Spike', message: 'Transaction volume increased by 200% in the last hour.' },
    { title: 'New Address Activity', message: 'Previously dormant address has become active after 6 months.' },
    { title: 'Cross-Asset Movement', message: 'Funds being rapidly moved across multiple assets.' },
    { title: 'Whale Movement', message: 'Large holder initiated significant position change.' },
  ]
  
  const template = templates[Math.floor(Math.random() * templates.length)]
  const severity = severities[Math.floor(Math.random() * severities.length)]
  
  return {
    id: `alert-${Date.now()}`,
    severity,
    title: template.title,
    message: template.message,
    timestamp: new Date().toISOString(),
    acknowledged: false,
  }
}
