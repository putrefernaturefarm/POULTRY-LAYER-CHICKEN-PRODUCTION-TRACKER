'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, ChevronDown, LogOut, Menu, Settings, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useFarmStore } from '@/store/farm'
import { toast } from 'sonner'
import MobileDrawer from './MobileDrawer'

export default function TopBar({ userName }: { userName?: string }) {
  const router       = useRouter()
  const farm         = useFarmStore((s) => s.farm)
  const [open, setOpen]           = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      <header
        className="h-14 flex items-center justify-between px-4 md:px-6 sticky top-0 z-40"
        style={{ background: 'var(--paper-2)', borderBottom: '1px solid var(--line-strong)' }}
      >
        {/* Left: hamburger (mobile) + farm name (desktop) */}
        <div className="flex items-center gap-3">
          {/* Hamburger — mobile only */}
          <button
            className="md:hidden p-2 rounded-lg transition-colors"
            style={{ color: 'var(--ink)' }}
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>

          <span
            className="md:hidden text-sm font-bold"
            style={{ fontFamily: 'var(--font-serif, Georgia, serif)', color: 'var(--ink)' }}
          >
            LayerPro
          </span>
          {farm && (
            <span
              className="hidden md:block text-sm font-semibold"
              style={{ fontFamily: 'var(--font-serif, Georgia, serif)', color: 'var(--ink-soft)' }}
            >
              {farm.name}
            </span>
          )}
        </div>

        {/* Right: bell + user */}
        <div className="flex items-center gap-1.5">
          <button
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--ink-soft)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--paper)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <Bell size={17} />
          </button>

          <div className="relative">
            <button
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors"
              onClick={() => setOpen(!open)}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--paper)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'var(--green-bg)', color: 'var(--green)' }}
              >
                <User size={13} />
              </div>
              <span
                className="hidden md:block text-sm font-medium max-w-[120px] truncate"
                style={{ color: 'var(--ink)' }}
              >
                {userName ?? 'User'}
              </span>
              <ChevronDown size={13} style={{ color: 'var(--ink-soft)' }} />
            </button>

            {open && (
              <div
                className="absolute right-0 top-full mt-1 w-44 rounded-xl py-1 z-50"
                style={{
                  background: 'var(--paper-2)',
                  border: '1px solid var(--line-strong)',
                  boxShadow: '0 4px 20px -4px rgba(33,29,24,0.16)',
                }}
              >
                <button
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors"
                  style={{ color: 'var(--ink)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--paper)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  onClick={() => { setOpen(false); router.push('/settings') }}
                >
                  <Settings size={14} /> Settings
                </button>
                <div style={{ height: '1px', background: 'var(--line)', margin: '4px 0' }} />
                <button
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors"
                  style={{ color: 'var(--red)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--red-bg)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  onClick={handleLogout}
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile full-nav drawer */}
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}
