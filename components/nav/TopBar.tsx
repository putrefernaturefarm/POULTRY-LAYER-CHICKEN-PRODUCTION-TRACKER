'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, ChevronDown, LogOut, Settings, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useFarmStore } from '@/store/farm'
import { toast } from 'sonner'

export default function TopBar({ userName }: { userName?: string }) {
  const router  = useRouter()
  const farm    = useFarmStore((s) => s.farm)
  const [open, setOpen] = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6 sticky top-0 z-40">
      <div className="flex items-center gap-2">
        <span className="md:hidden text-sm font-bold text-farm-green-700">LayerPro</span>
        {farm && <span className="hidden md:block text-sm font-semibold text-gray-700">{farm.name}</span>}
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2 rounded-xl hover:bg-gray-100 relative">
          <Bell size={18} className="text-gray-500" />
        </button>

        <div className="relative">
          <button
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100"
            onClick={() => setOpen(!open)}
          >
            <div className="w-7 h-7 rounded-full bg-farm-green-100 flex items-center justify-center">
              <User size={14} className="text-farm-green-700" />
            </div>
            <span className="hidden md:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
              {userName ?? 'User'}
            </span>
            <ChevronDown size={14} className="text-gray-400" />
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-2xl shadow-float border border-gray-100 py-1 z-50">
              <button
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => { setOpen(false); router.push('/settings') }}
              >
                <Settings size={14} /> Settings
              </button>
              <hr className="my-1 border-gray-100" />
              <button
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
