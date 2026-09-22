'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Bird, Home, Layers, Egg, UtensilsCrossed, Droplets,
  Heart, AlertTriangle, Skull, Syringe, Pill, Scissors, Receipt, ShoppingBag,
  Package, Activity, Settings, ClipboardList, Zap
} from 'lucide-react'

const navGroups = [
  {
    label: 'Overview',
    items: [
      { href: '/dashboard',   label: 'Dashboard',         icon: LayoutDashboard },
      { href: '/quick-entry', label: 'Quick Daily Entry',  icon: Zap },
      { href: '/analytics',   label: 'Analytics',          icon: Activity },
    ],
  },
  {
    label: 'Farm',
    items: [
      { href: '/farms',  label: 'Farm Profile',   icon: Home },
      { href: '/houses', label: 'Poultry Houses', icon: Layers },
      { href: '/flocks', label: 'Flocks',         icon: Bird },
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
      { href: '/expenses',  label: 'Expenses',  icon: Receipt },
      { href: '/sales',     label: 'Sales',     icon: ShoppingBag },
      { href: '/inventory', label: 'Inventory', icon: Package },
    ],
  },
  {
    label: 'Reports',
    items: [
      { href: '/reports', label: 'All Reports', icon: ClipboardList },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/settings', label: 'Settings', icon: Settings },
    ],
  },
]

interface Props {
  open: boolean
  onClose: () => void
}

export default function MobileDrawer({ open, onClose }: Props) {
  const pathname = usePathname()

  // Close drawer on route change
  useEffect(() => { onClose() }, [pathname])

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(33,29,24,0.5)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className="absolute left-0 top-0 bottom-0 w-72 flex flex-col overflow-y-auto"
        style={{ background: 'var(--paper-2)', borderRight: '1px solid var(--line-strong)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-4"
          style={{ borderBottom: '2px solid var(--ink)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
              style={{ background: 'var(--ink)', color: 'var(--paper)' }}
            >
              🐔
            </div>
            <div>
              <p
                className="text-sm font-bold leading-tight"
                style={{ fontFamily: 'var(--font-serif, Georgia, serif)', color: 'var(--ink)' }}
              >
                LayerPro
              </p>
              <p
                className="leading-tight"
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  color: 'var(--gold)',
                  fontSize: '9px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                Production Tracker
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--ink-soft)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 px-3 py-4 space-y-5">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="section-title px-2 mb-1.5">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href || pathname.startsWith(href + '/')
                  return (
                    <Link key={href} href={href} className={cn('nav-item', active && 'active')}>
                      <Icon size={16} />
                      <span>{label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div
          className="px-4 py-3 text-center"
          style={{
            borderTop: '1px solid var(--line)',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '9px',
            color: 'var(--line-strong)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          LayerPro · v1.0
        </div>
      </div>
    </div>
  )
}
