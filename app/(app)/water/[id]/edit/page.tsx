import { requireUser, getCurrentFarm } from '@/lib/session'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import EditWaterForm from './EditWaterForm'

export const metadata = { title: 'Edit Water Record | LayerPro' }

export default async function EditWaterPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) notFound()

  const { id } = await params
  const supabase = await createClient()

  const [{ data: record }, { data: flocks }, { data: houses }] = await Promise.all([
    supabase.from('water_records').select('*').eq('id', id).eq('farm_id', farm.id).single(),
    supabase.from('flocks').select('id, flock_code').eq('farm_id', farm.id).eq('status', 'active').order('flock_code'),
    supabase.from('poultry_houses').select('id, name').eq('farm_id', farm.id).eq('is_active', true).order('name'),
  ])

  if (!record) notFound()

  return (
    <div className="p-4 md:p-6 max-w-xl mx-auto">
      <h1 className="page-title mb-6">Edit Water Record</h1>
      <EditWaterForm record={record} flocks={flocks ?? []} houses={houses ?? []} />
    </div>
  )
}
