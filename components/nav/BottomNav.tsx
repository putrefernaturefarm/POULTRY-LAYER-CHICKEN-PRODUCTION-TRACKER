'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Egg, AlertTriangle, ShoppingBag, Zap } from 'lucide-react'

const items = [
  { href: '/dashboard',   label: 'Home',        icon: LayoutDashboard },
  { href: '/production',  label: 'Eggs',        icon: Egg },
  { href: '/quick-entry', label: 'Quick Entry', icon: Zap },
  { href: '/morbidity',   label: 'Morbidity',   icon: AlertTriangle },
  { href: '/sales',       label: 'Sales',       icon: ShoppingBag },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'var(--paper-2)',
        borderTop: '1px solid var(--line-strong)',
        boxShadow: '0 -2px 12px rgba(33,29,24,0.08)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center py-2.5 gap-1"
              style={{
                color: active ? 'var(--green)' : 'var(--ink-soft)',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '9px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontWeight: active ? 600 : 400,
                textDecoration: 'none',
              }}
            >
              <Icon size={19} />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
