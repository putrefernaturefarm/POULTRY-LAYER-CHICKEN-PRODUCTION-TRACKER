import { requireUser, getCurrentFarm } from '@/lib/session'
import { createClient } from '@/lib/supabase/server'
import MorbidityForm from '@/components/morbidity/MorbidityForm'

export default async function NewMorbidityPage() {
  await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) return <div className="p-6"><p className="text-gray-500">No farm found.</p></div>

  const supabase = await createClient()
  const { data: flocks } = await supabase
    .from('flocks').select('id, flock_code, breed_strain')
    .eq('farm_id', farm.id).eq('status', 'active')

  const { data: houses } = await supabase
    .from('poultry_houses').select('id, name, code')
    .eq('farm_id', farm.id).eq('is_active', true)

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="page-title">Log Morbidity Event</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Record birds showing illness signs or affected by a disease/condition.
          This is separate from mortality (deaths).
        </p>
      </div>
      <MorbidityForm flocks={flocks ?? []} houses={houses ?? []} />
    </div>
  )
}
