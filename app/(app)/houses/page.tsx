import { requireUser, getCurrentFarm } from '@/lib/session'
import { createClient } from '@/lib/supabase/server'
import { Layers, Plus, Pencil } from 'lucide-react'
import Link from 'next/link'
import { HOUSING_TYPES } from '@/lib/constants'

export default async function HousesPage() {
  await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) return <div className="p-6"><p className="text-gray-500">No farm found.</p></div>

  const supabase = await createClient()
  const { data: houses } = await supabase
    .from('poultry_houses')
    .select('*')
    .eq('farm_id', farm.id)
    .order('created_at', { ascending: true })

  const typLabel = (v: string) => HOUSING_TYPES.find(t => t.value === v)?.label ?? v

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title flex items-center gap-2"><Layers size={24} className="text-blue-500" /> Poultry Houses</h1>
        <Link href="/houses/new" className="btn-primary"><Plus size={16} /> Add House</Link>
      </div>

      {!houses || houses.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-4">🏠</div>
          <p className="font-medium text-gray-700 mb-1">No houses added yet</p>
          <Link href="/houses/new" className="btn-primary inline-flex mt-4"><Plus size={16} /> Add House</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {houses.map(h => (
            <div key={h.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900">{h.name}</h3>
                  {h.code && <p className="text-xs text-gray-400">{h.code}</p>}
                </div>
                <span className={`badge ${h.is_active ? 'badge-green' : 'badge-gray'}`}>
                  {h.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              {h.housing_type && <p className="text-sm text-gray-500">{typLabel(h.housing_type)}</p>}
              {h.capacity && <p className="text-sm text-gray-500">Capacity: {h.capacity.toLocaleString()} birds</p>}
              {h.description && <p className="text-xs text-gray-400 mt-2">{h.description}</p>}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <Link href={`/houses/${h.id}/edit`} className="btn-ghost text-xs flex items-center gap-1 w-fit">
                  <Pencil size={12} /> Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
