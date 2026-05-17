# Contributing to SFLM Security Dashboard

Welcome to the Stellar Freeze List Manager (SFLM) project! We're excited that you're interested in contributing.

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Git
- Basic understanding of React, TypeScript, and the Stellar network

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/sflm-dashboard.git
   cd sflm-dashboard
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start the development server**
   ```bash
   pnpm dev
   ```

4. **Open the dashboard**
   Navigate to `http://localhost:3000/dashboard`

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── assets/        # Asset inventory endpoints
│   │   ├── dashboard/     # Dashboard stats endpoint
│   │   ├── transactions/  # Transaction endpoints (including SSE stream)
│   │   └── wallet/        # Wallet balance endpoint
│   ├── dashboard/         # Command Center page
│   └── inventory/         # Asset Inventory page
├── components/
│   ├── dashboard/         # Dashboard-specific components
│   ├── inventory/         # Inventory-specific components
│   └── ui/               # shadcn/ui base components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities, types, mock data
└── public/               # Static assets
```

## Coding Standards

### TypeScript

- **Always use explicit types** - Never use `any` or implicit `any`
- **Use function declarations** for components, not arrow functions:
  ```typescript
  // Good
  function MyComponent({ prop }: MyComponentProps) {
    return <div>{prop}</div>
  }

  // Avoid
  const MyComponent = ({ prop }: MyComponentProps) => {
    return <div>{prop}</div>
  }
  ```
- **Export types separately** from implementations
- **Use `interface` for object shapes**, `type` for unions/aliases

### React

- **Use named exports** for components (except page.tsx files)
- **Colocate hooks** with their consuming components when single-use
- **Use SWR** for data fetching and caching
- **Avoid useEffect for data fetching** - use RSC or SWR instead

### Styling

- Use **Tailwind CSS** classes
- Use **semantic design tokens** (bg-background, text-foreground, etc.)
- Follow the established color system:
  - `primary` (emerald) - Safe/positive states
  - `critical` (orange) - Critical alerts
  - `warning` (yellow) - Warning states
  - `muted` - Secondary information

### File Naming

- Components: `PascalCase.tsx` (e.g., `TransactionTable.tsx`)
- Hooks: `use-kebab-case.ts` (e.g., `use-transaction-stream.ts`)
- Types: `types.ts` or `ComponentName.types.ts`
- Utils: `kebab-case.ts`

## Good First Issues

Looking for a place to start? Check out our [good first issues](./good-first-issues.json) which include:

1. **Add transaction search** - Add a search input to filter transactions by hash or address
2. **Add asset detail view** - Create a detailed asset information page
3. **Improve accessibility** - Add ARIA labels and keyboard navigation
4. **Add dark/light mode toggle** - Implement theme switching
5. **Add export functionality** - Export transaction/asset data to CSV

## Pull Request Process

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the coding standards above

3. **Run linting and type checks**:
   ```bash
   pnpm lint
   pnpm type-check
   ```

4. **Test your changes** in the browser

5. **Create a pull request** with:
   - Clear title describing the change
   - Description of what and why
   - Screenshots for UI changes
   - Link to related issue if applicable

## API Development

### Adding New API Routes

1. Create a new route file in `app/api/[endpoint]/route.ts`
2. Use the `ApiResponse<T>` type for consistent responses:
   ```typescript
   import type { ApiResponse } from '@/lib/types'
   
   export async function GET(): Promise<NextResponse<ApiResponse<YourDataType>>> {
     return NextResponse.json({
       success: true,
       data: yourData,
       timestamp: new Date().toISOString(),
     })
   }
   ```

### Working with Mock Data

During development, we use mock data defined in `lib/mock-data.ts`. When adding new features:

1. Add mock data generators in `mock-data.ts`
2. Use realistic Stellar addresses and values
3. Include risk scoring for transaction-related data

## Component Development

### Creating New Components

1. Start with a JSDoc comment explaining the component's purpose
2. Define props interface with descriptions
3. Use shadcn/ui primitives where possible
4. Follow the established component patterns

Example:
```typescript
'use client'

/**
 * MyComponent
 * Brief description of what this component does
 */

import { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

interface MyComponentProps {
  /** Description of this prop */
  someProp: string
  /** Optional prop with default */
  optionalProp?: boolean
}

export function MyComponent({ 
  someProp, 
  optionalProp = false 
}: MyComponentProps) {
  return (
    <div className={cn('base-classes', optionalProp && 'conditional-class')}>
      {someProp}
    </div>
  )
}
```

## Questions?

- Open a discussion on GitHub
- Check existing issues for similar questions
- Reach out to maintainers

Thank you for contributing to SFLM!
