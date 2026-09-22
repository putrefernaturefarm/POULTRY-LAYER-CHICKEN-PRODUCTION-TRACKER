import { requireUser, getCurrentFarm } from '@/lib/session'
import { createClient } from '@/lib/supabase/server'
import MortalityForm from '@/components/health/MortalityForm'

export default async function NewMortalityPage() {
  await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) return <div className="p-6"><p className="text-gray-500">No farm found.</p></div>

  const supabase = await createClient()
  const { data: flocks } = await supabase
    .from('flocks').select('id, flock_code').eq('farm_id', farm.id).eq('status', 'active')
  const { data: houses } = await supabase
    .from('poultry_houses').select('id, name').eq('farm_id', farm.id).eq('is_active', true)

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <h1 className="page-title mb-2">Log Mortality</h1>
      <p className="text-sm text-gray-500 mb-6">Record bird deaths — tracked separately from morbidity.</p>
      <MortalityForm flocks={flocks ?? []} houses={houses ?? []} />
    </div>
  )
}
