import { requireUser, getCurrentFarm } from '@/lib/session'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import EditFeedForm from './EditFeedForm'

export const metadata = { title: 'Edit Feed Record | LayerPro' }

export default async function EditFeedPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) notFound()

  const { id } = await params
  const supabase = await createClient()

  const [{ data: record }, { data: flocks }, { data: houses }] = await Promise.all([
    supabase.from('feed_records').select('*').eq('id', id).eq('farm_id', farm.id).single(),
    supabase.from('flocks').select('id, flock_code').eq('farm_id', farm.id).eq('status', 'active').order('flock_code'),
    supabase.from('poultry_houses').select('id, name').eq('farm_id', farm.id).eq('is_active', true).order('name'),
  ])

  if (!record) notFound()

  return (
    <div className="p-4 md:p-6 max-w-xl mx-auto">
      <h1 className="page-title mb-6">Edit Feed Record</h1>
      <EditFeedForm record={record} flocks={flocks ?? []} houses={houses ?? []} />
    </div>
  )
}
