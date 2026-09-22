import { requireUser, getCurrentFarm } from '@/lib/session'
import { createClient } from '@/lib/supabase/server'
import NewFlockForm from '@/components/flocks/NewFlockForm'

export default async function NewFlockPage() {
  await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) return <div className="p-6"><p className="text-gray-500">No farm found.</p></div>

  const supabase = await createClient()
  const { data: houses } = await supabase
    .from('poultry_houses').select('id, name, code')
    .eq('farm_id', farm.id).eq('is_active', true)

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <h1 className="page-title mb-6">Add New Flock</h1>
      <NewFlockForm houses={houses ?? []} />
    </div>
  )
}
