import { requireUser, getCurrentFarm } from '@/lib/session'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import UpdateMorbidityForm from '@/components/morbidity/UpdateMorbidityForm'
import { formatDate, formatPct } from '@/lib/utils'

export default async function UpdateMorbidityPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser()
  const { id } = await params
  const supabase = await createClient()

  const { data: record } = await supabase
    .from('morbidity_records')
    .select('*, flocks(flock_code), poultry_houses(name)')
    .eq('id', id)
    .single()

  if (!record) notFound()

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <h1 className="page-title mb-1">Update Morbidity Record</h1>
      <p className="text-sm text-gray-500 mb-6">
        {formatDate(record.record_date)} — {(record.flocks as {flock_code:string})?.flock_code} — {record.condition_disease}
        {' '}({record.num_affected} affected, {formatPct(record.morbidity_rate ?? 0)} morbidity rate)
      </p>
      <UpdateMorbidityForm record={record} />
    </div>
  )
}
