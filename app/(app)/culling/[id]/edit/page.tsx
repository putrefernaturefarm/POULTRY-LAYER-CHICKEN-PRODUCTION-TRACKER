import { requireUser, getCurrentFarm } from '@/lib/session'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import EditCullingForm from './EditCullingForm'

export const metadata = { title: 'Edit Culling Record | LayerPro' }

export default async function EditCullingPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) notFound()

  const { id } = await params
  const supabase = await createClient()

  const [{ data: record }, { data: flocks }, { data: houses }] = await Promise.all([
    supabase.from('culling_records').select('*').eq('id', id).eq('farm_id', farm.id).single(),
    supabase.from('flocks').select('id, flock_code').eq('farm_id', farm.id).eq('status', 'active').order('flock_code'),
    supabase.from('poultry_houses').select('id, name').eq('farm_id', farm.id).eq('is_active', true).order('name'),
  ])

  if (!record) notFound()

  return (
    <div className="p-4 md:p-6 max-w-xl mx-auto">
      <h1 className="page-title mb-6">Edit Culling Record</h1>
      <EditCullingForm record={record} flocks={flocks ?? []} houses={houses ?? []} />
    </div>
  )
}
