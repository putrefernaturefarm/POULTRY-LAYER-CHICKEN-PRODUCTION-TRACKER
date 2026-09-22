import { requireUser, getCurrentFarm } from '@/lib/session'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NewWaterForm from '@/components/water/NewWaterForm'

export const metadata = { title: 'Log Water | LayerPro' }

export default async function NewWaterPage() {
  await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) redirect('/farms')

  const supabase = await createClient()
  const [{ data: flocks }, { data: houses }] = await Promise.all([
    supabase.from('flocks').select('id, flock_code, breed_strain, initial_population')
      .eq('farm_id', farm.id).eq('status', 'active').order('flock_code'),
    supabase.from('poultry_houses').select('id, name')
      .eq('farm_id', farm.id).eq('is_active', true).order('name'),
  ])

  return (
    <div className="p-4 md:p-6 max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="page-title">Log Water Consumption</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--ink-soft)' }}>{farm.name}</p>
      </div>
      <NewWaterForm flocks={flocks ?? []} houses={houses ?? []} />
    </div>
  )
}
