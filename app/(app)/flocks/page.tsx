import { requireUser, getCurrentFarm } from '@/lib/session'
import { createClient } from '@/lib/supabase/server'
import { formatDate, statusColor, cn } from '@/lib/utils'
import { Bird, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function FlocksPage() {
  await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) return <div className="p-6"><p className="text-gray-500">No farm found.</p></div>

  const supabase = await createClient()
  const { data: flocks } = await supabase
    .from('flocks')
    .select('*, poultry_houses(name, code)')
    .eq('farm_id', farm.id)
    .order('date_received', { ascending: false })

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title flex items-center gap-2">
          <Bird size={24} className="text-purple-500" /> Flocks
        </h1>
        <Link href="/flocks/new" className="btn-primary"><Plus size={16} /> Add Flock</Link>
      </div>

      <div className="card">
        {!flocks || flocks.length === 0 ? (
          <div className="text-center py-10">
            <Bird size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No flocks yet</p>
            <Link href="/flocks/new" className="btn-primary mt-4 inline-flex"><Plus size={16} /> Add First Flock</Link>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Flock Code</th>
                  <th>Breed/Strain</th>
                  <th>House</th>
                  <th>Date Received</th>
                  <th>Initial Pop.</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {flocks.map((f) => (
                  <tr key={f.id}>
                    <td className="font-semibold">{f.flock_code}</td>
                    <td>{f.breed_strain ?? '—'}</td>
                    <td>{(f.poultry_houses as {name: string})?.name ?? '—'}</td>
                    <td>{formatDate(f.date_received)}</td>
                    <td>{f.initial_population?.toLocaleString()}</td>
                    <td><span className={cn('badge', statusColor(f.status))}>{f.status}</span></td>
                    <td>
                      <Link href={`/flocks/${f.id}`} className="text-farm-green-600 hover:underline text-xs font-medium">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
