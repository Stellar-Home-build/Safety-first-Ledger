'use client'

/**
 * DashboardHeader Component
 * Main navigation header for the security dashboard
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { WalletConnect } from './wallet-connect'
import { LiveIndicator } from './live-indicator'
import { ShieldCheckIcon, LayoutDashboardIcon, PackageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardHeaderProps {
  isConnected: boolean
  error?: string | null
}

const navItems = [
  {
    href: '/dashboard',
    label: 'Command Center',
    icon: LayoutDashboardIcon,
  },
  {
    href: '/inventory',
    label: 'Inventory',
    icon: PackageIcon,
  },
]

export function DashboardHeader({ isConnected, error }: DashboardHeaderProps) {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <ShieldCheckIcon className="h-8 w-8 text-primary" />
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-none">SFLM</span>
              <span className="text-xs text-muted-foreground">Security Dashboard</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <LiveIndicator isConnected={isConnected} error={error} />
          <WalletConnect />
        </div>
      </div>
    </header>
  )
}
