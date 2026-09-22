import { requireUser, getCurrentFarm } from '@/lib/session'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import EditHouseForm from './EditHouseForm'

export const metadata = { title: 'Edit House | LayerPro' }

export default async function EditHousePage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) notFound()

  const { id } = await params
  const supabase = await createClient()
  const { data: house } = await supabase
    .from('poultry_houses').select('*').eq('id', id).eq('farm_id', farm.id).single()

  if (!house) notFound()

  return (
    <div className="p-4 md:p-6 max-w-xl mx-auto">
      <h1 className="page-title mb-1">Edit Poultry House</h1>
      <p className="text-sm text-gray-400 mb-6">{house.name}</p>
      <EditHouseForm house={house} />
    </div>
  )
}
