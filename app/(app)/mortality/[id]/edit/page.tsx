import { requireUser, getCurrentFarm } from '@/lib/session'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import EditMortalityForm from './EditMortalityForm'

export const metadata = { title: 'Edit Mortality Record | LayerPro' }

export default async function EditMortalityPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) notFound()

  const { id } = await params
  const supabase = await createClient()

  const [{ data: record }, { data: flocks }] = await Promise.all([
    supabase.from('mortality_records').select('*').eq('id', id).eq('farm_id', farm.id).single(),
    supabase.from('flocks').select('id, flock_code').eq('farm_id', farm.id),
  ])

  if (!record) notFound()

  return (
    <div className="p-4 md:p-6 max-w-xl mx-auto">
      <h1 className="page-title mb-6">Edit Mortality Record</h1>
      <EditMortalityForm record={record} flocks={flocks ?? []} />
    </div>
  )
}
