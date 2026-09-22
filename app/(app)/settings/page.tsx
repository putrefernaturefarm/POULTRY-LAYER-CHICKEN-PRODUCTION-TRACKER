import { requireUser } from '@/lib/session'
import { createClient } from '@/lib/supabase/server'
import { Settings, User, Home, Lock } from 'lucide-react'
import Link from 'next/link'

export default async function SettingsPage() {
  const user = await requireUser()
  const supabase = await createClient()
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="page-title flex items-center gap-2"><Settings size={24} /> Settings</h1>

      <div className="card space-y-4">
        <p className="section-title">Account</p>
        <div className="flex items-center gap-3 py-2">
          <div className="w-10 h-10 rounded-full bg-farm-green-100 flex items-center justify-center">
            <User size={18} className="text-farm-green-700" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{profile?.full_name ?? '—'}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="card space-y-2">
        <p className="section-title">Navigation</p>
        {[
          { href: '/farms',   icon: Home, label: 'Farm Profile',    desc: 'Manage farm information and details.' },
          { href: '/houses',  icon: Home, label: 'Poultry Houses',  desc: 'Configure houses and capacity.' },
        ].map(({ href, icon: Icon, label, desc }) => (
          <Link key={href} href={href}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
            <Icon size={18} className="text-gray-500 shrink-0" />
            <div>
              <p className="font-medium text-gray-800">{label}</p>
              <p className="text-xs text-gray-400">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="card">
        <p className="text-xs text-gray-400 text-center">
          LayerPro v1.0 &nbsp;·&nbsp; Poultry Layer Chicken Production Tracker<br />
          This system is a farm record and decision-support tool, not a replacement for veterinary advice.
        </p>
      </div>
    </div>
  )
}
