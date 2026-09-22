import { requireUser, getCurrentFarm } from '@/lib/session'
import { createClient } from '@/lib/supabase/server'
import NewDebeakingForm from '@/components/debeaking/NewDebeakingForm'
import { Scissors } from 'lucide-react'

export const metadata = { title: 'Log Debeaking | LayerPro' }

export default async function NewDebeakingPage() {
  await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) return <div className="p-6"><p style={{ color: 'var(--ink-soft)' }}>No farm found.</p></div>

  const supabase = await createClient()
  const [{ data: flocks }, { data: houses }] = await Promise.all([
    supabase.from('flocks').select('id, flock_code, breed_strain').eq('farm_id', farm.id).eq('status', 'active').order('flock_code'),
    supabase.from('poultry_houses').select('id, name').eq('farm_id', farm.id).eq('is_active', true).order('name'),
  ])

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="page-title flex items-center gap-2">
          <Scissors size={20} style={{ color: 'var(--amber)' }} /> Log Debeaking Session
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--ink-soft)' }}>
          Record beak trimming for a flock
        </p>
      </div>
      <NewDebeakingForm
        farmId={farm.id}
        flocks={flocks ?? []}
        houses={houses ?? []}
      />
    </div>
  )
}
