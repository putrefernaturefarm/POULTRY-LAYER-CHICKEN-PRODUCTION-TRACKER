import { requireUser, getCurrentFarm } from '@/lib/session'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import EditProductionForm from './EditProductionForm'

export const metadata = { title: 'Edit Production Record | LayerPro' }

export default async function EditProductionPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) notFound()

  const { id } = await params
  const supabase = await createClient()
  const { data: record } = await supabase
    .from('daily_production')
    .select('*, flocks(flock_code)')
    .eq('id', id).eq('farm_id', farm.id).single()

  if (!record) notFound()

  return (
    <div className="p-4 md:p-6 max-w-xl mx-auto">
      <h1 className="page-title mb-1">Edit Production Record</h1>
      <p className="text-sm text-gray-400 mb-6">
        {(record.flocks as {flock_code:string})?.flock_code} — {record.record_date}
      </p>
      <EditProductionForm record={record} />
    </div>
  )
}
