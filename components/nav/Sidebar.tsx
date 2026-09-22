'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Bird, Home, Layers, Egg, UtensilsCrossed, Droplets,
  Heart, AlertTriangle, Skull, Syringe, Pill, Scissors, Receipt, ShoppingBag,
  Package, BarChart3, Activity, Settings, ClipboardList, Zap
} from 'lucide-react'

const navGroups = [
  {
    label: 'Overview',
    items: [
      { href: '/dashboard',    label: 'Dashboard',       icon: LayoutDashboard },
      { href: '/quick-entry',  label: 'Quick Daily Entry', icon: Zap },
      { href: '/analytics',   label: 'Analytics',        icon: Activity },
    ],
  },
  {
    label: 'Farm',
    items: [
      { href: '/farms',   label: 'Farm Profile',    icon: Home },
      { href: '/houses',  label: 'Poultry Houses',  icon: Layers },
      { href: '/flocks',  label: 'Flocks',          icon: Bird },
    ],
  },
  {
    label: 'Daily Records',
    items: [
      { href: '/production', label: 'Egg Production', icon: Egg },
      { href: '/feed',       label: 'Feed',           icon: UtensilsCrossed },
      { href: '/water',      label: 'Water',          icon: Droplets },
    ],
  },
  {
    label: 'Health',
    items: [
      { href: '/health',      label: 'Health Events', icon: Heart },
      { href: '/morbidity',   label: 'Morbidity',     icon: AlertTriangle },
      { href: '/mortality',   label: 'Mortality',     icon: Skull },
      { href: '/vaccination', label: 'Vaccination',   icon: Syringe },
      { href: '/medication',  label: 'Medication',    icon: Pill },
      { href: '/culling',     label: 'Culling',       icon: Scissors },
    ],
  },
  {
    label: 'Business',
    items: [
      { href: '/expenses',  label: 'Expenses',   icon: Receipt },
      { href: '/sales',     label: 'Sales',      icon: ShoppingBag },
      { href: '/inventory', label: 'Inventory',  icon: Package },
    ],
  },
  {
    label: 'Reports',
    items: [
      { href: '/reports',  label: 'All Reports', icon: ClipboardList },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/settings', label: 'Settings', icon: Settings },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-gray-100 bg-white h-screen sticky top-0 overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100">
        <div className="w-9 h-9 rounded-xl bg-farm-green-600 flex items-center justify-center text-white text-lg">🐔</div>
        <div>
          <p className="text-sm font-bold text-gray-900">LayerPro</p>
          <p className="text-xs text-gray-400">Production Tracker</p>
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 px-3 py-4 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="section-title px-3 mb-1">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(href + '/')
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn('nav-item', active && 'active')}
                  >
                    <Icon size={16} />
                    <span>{label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}
