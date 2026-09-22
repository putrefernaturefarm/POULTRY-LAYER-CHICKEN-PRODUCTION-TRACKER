import { requireUser, getCurrentFarm } from '@/lib/session'
import { createClient } from '@/lib/supabase/server'
import QuickEntryForm from './QuickEntryForm'

export default async function QuickEntryPage() {
  await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) return <div className="p-6"><p className="text-gray-500">No farm found.</p></div>

  const supabase = await createClient()
  const { data: flocks } = await supabase
    .from('flocks')
    .select('id, flock_code, breed_strain')
    .eq('farm_id', farm.id)
    .eq('status', 'active')
    .order('flock_code')

  return <QuickEntryForm flocks={flocks ?? []} />
}
