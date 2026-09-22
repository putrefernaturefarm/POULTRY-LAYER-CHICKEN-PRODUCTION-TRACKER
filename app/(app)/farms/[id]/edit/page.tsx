import { requireUser } from '@/lib/session'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import EditFarmForm from './EditFarmForm'

export const metadata = { title: 'Edit Farm | LayerPro' }

export default async function EditFarmPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser()
  const { id } = await params
  const supabase = await createClient()

  const { data: farm } = await supabase
    .from('farms')
    .select('*')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  if (!farm) notFound()

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <h1 className="page-title mb-6">Edit Farm Profile</h1>
      <EditFarmForm farm={farm} />
    </div>
  )
}
