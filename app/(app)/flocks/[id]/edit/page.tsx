import { requireUser, getCurrentFarm } from '@/lib/session'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import EditFlockForm from './EditFlockForm'

export const metadata = { title: 'Edit Flock | LayerPro' }

export default async function EditFlockPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) notFound()

  const { id } = await params
  const supabase = await createClient()

  const [{ data: flock }, { data: houses }] = await Promise.all([
    supabase.from('flocks').select('*').eq('id', id).eq('farm_id', farm.id).single(),
    supabase.from('poultry_houses').select('id, name, code').eq('farm_id', farm.id).eq('is_active', true),
  ])

  if (!flock) notFound()

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <h1 className="page-title mb-1">Edit Flock</h1>
      <p className="text-sm text-gray-400 mb-6">{flock.flock_code}</p>
      <EditFlockForm flock={flock} houses={houses ?? []} />
    </div>
  )
}
