import { requireUser, getCurrentFarm } from '@/lib/session'
import { createClient } from '@/lib/supabase/server'
import EditDebeakingForm from '@/components/debeaking/EditDebeakingForm'
import { notFound } from 'next/navigation'
import { Scissors } from 'lucide-react'

export const metadata = { title: 'Edit Debeaking | LayerPro' }

export default async function EditDebeakingPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) return <div className="p-6"><p style={{ color: 'var(--ink-soft)' }}>No farm found.</p></div>

  const { id } = await params
  const supabase = await createClient()

  const [{ data: record }, { data: flocks }, { data: houses }] = await Promise.all([
    supabase.from('debeaking_records').select('*').eq('id', id).eq('farm_id', farm.id).single(),
    supabase.from('flocks').select('id, flock_code, breed_strain').eq('farm_id', farm.id).eq('status', 'active').order('flock_code'),
    supabase.from('poultry_houses').select('id, name').eq('farm_id', farm.id).eq('is_active', true).order('name'),
  ])

  if (!record) notFound()

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="page-title flex items-center gap-2">
        <Scissors size={20} style={{ color: 'var(--amber)' }} /> Edit Debeaking Record
      </h1>
      <EditDebeakingForm
        record={record}
        flocks={flocks ?? []}
        houses={houses ?? []}
      />
    </div>
  )
}
