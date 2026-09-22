import { requireUser, getCurrentFarm } from '@/lib/session'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NewProductionForm from '@/components/production/NewProductionForm'

export default async function NewProductionPage() {
  await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) redirect('/farms?setup=production')

  const supabase = await createClient()

  const [{ data: flocks }, { data: houses }] = await Promise.all([
    supabase
      .from('flocks')
      .select('id, flock_code, breed_strain')
      .eq('farm_id', farm.id)
      .eq('status', 'active')
      .order('flock_code'),
    supabase
      .from('poultry_houses')
      .select('id, name')
      .eq('farm_id', farm.id)
      .eq('is_active', true)
      .order('name'),
  ])

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="page-title">Record Egg Production</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--ink-soft)' }}>
          Daily egg collection — {farm.name}
        </p>
      </div>
      <NewProductionForm
        farmId={farm.id}
        flocks={flocks ?? []}
        houses={houses ?? []}
      />
    </div>
  )
}
