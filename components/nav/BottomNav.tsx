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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-nav z-50"
         style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center py-2 text-xs font-medium gap-1',
                active ? 'text-farm-green-600' : 'text-gray-400'
              )}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
