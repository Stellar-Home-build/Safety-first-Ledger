# SFLM Security Dashboard

A real-time security monitoring and asset management dashboard for the [Stellar](https://stellar.org) ecosystem. SFLM (Stellar Freeze List Manager) lets operators monitor live transactions, assess risk, manage asset freeze states, and respond to security alerts — all from a single interface.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)
![Stellar](https://img.shields.io/badge/Stellar-SDK-7d00ff?logo=stellar)

## Features

- **Live Transaction Feed** — real-time transaction stream via Server-Sent Events (SSE) with automatic risk scoring
- **Risk Assessment** — transactions are scored 0–100 and classified as `low`, `medium`, `high`, or `critical`
- **Security Alerts** — actionable alerts with severity levels, acknowledgement, and correlation to transactions
- **Asset Inventory** — view and manage Stellar assets with freeze/unfreeze controls
- **Wallet Integration** — connect via [Freighter](https://freighter.app) to sign on-chain operations
- **Dashboard Stats** — 24h transaction volume, flagged count, frozen accounts, and network health at a glance

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5.7 |
| Styling | Tailwind CSS 4 |
| UI Components | shadcn/ui + Radix UI |
| Data Fetching | SWR |
| Charts | Recharts |
| Blockchain | Stellar SDK + Freighter API |
| Analytics | Vercel Analytics |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/sflm-dashboard.git
cd sflm-dashboard

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to `/dashboard` automatically.

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript compiler check
```

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── assets/          # Asset inventory endpoints
│   │   ├── dashboard/       # Dashboard stats endpoint
│   │   ├── transactions/    # Transaction list + SSE stream
│   │   └── wallet/          # Wallet balance endpoint
│   ├── dashboard/           # Command Center page
│   └── inventory/           # Asset Inventory page
├── components/
│   ├── dashboard/           # Dashboard-specific components
│   ├── inventory/           # Inventory-specific components
│   └── ui/                  # shadcn/ui base components
├── hooks/                   # Custom React hooks (SWR, SSE, wallet)
├── lib/
│   ├── mock-data.ts         # Simulated Stellar data for development
│   ├── types.ts             # Shared TypeScript types
│   └── utils.ts             # Utility functions
└── public/                  # Static assets and icons
```

## Pages

### `/dashboard` — Command Center

The main view. Shows live stats, active security alerts, and a real-time transaction feed. The feed can be paused and resumed without losing data. Transactions are color-coded by risk level.

### `/inventory` — Asset Inventory

Lists all managed Stellar assets with their current freeze status, holder counts, and supply. Supports initiating freeze and unfreeze operations via a confirmation dialog.

## API Routes

| Route | Method | Description |
|---|---|---|
| `/api/dashboard` | GET | Dashboard statistics |
| `/api/transactions` | GET | Recent transactions |
| `/api/transactions/stream` | GET | SSE stream of live transactions and alerts |
| `/api/assets` | GET | Asset inventory |
| `/api/wallet` | GET | Wallet balance for a given public key |

## Development Notes

The dashboard currently runs against **mock data** defined in `lib/mock-data.ts`. This simulates realistic Stellar transactions, risk scoring, and alerts so the full UI can be developed and tested without a live network connection.

To connect to a real Stellar network, replace the mock data sources in the API routes with calls to the Stellar Horizon API or your own backend.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for coding standards, branch workflow, and a list of good first issues.

## License

MIT
