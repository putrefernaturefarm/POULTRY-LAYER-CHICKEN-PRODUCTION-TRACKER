import { requireUser, getCurrentFarm } from '@/lib/session'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import EditSaleForm from './EditSaleForm'

export const metadata = { title: 'Edit Sale | LayerPro' }

export default async function EditSalePage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) notFound()

  const { id } = await params
  const supabase = await createClient()

  const [{ data: sale }, { data: flocks }] = await Promise.all([
    supabase.from('sales').select('*').eq('id', id).eq('farm_id', farm.id).single(),
    supabase.from('flocks').select('id, flock_code').eq('farm_id', farm.id).eq('status', 'active').order('flock_code'),
  ])

  if (!sale) notFound()

  return (
    <div className="p-4 md:p-6 max-w-xl mx-auto">
      <h1 className="page-title mb-6">Edit Sale</h1>
      <EditSaleForm sale={sale} flocks={flocks ?? []} />
    </div>
  )
}
