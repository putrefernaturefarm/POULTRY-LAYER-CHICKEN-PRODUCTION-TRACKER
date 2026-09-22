import { requireUser, getCurrentFarm } from '@/lib/session'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatDate, statusColor, cn } from '@/lib/utils'
import { Bird, Pencil, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function FlockDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) notFound()

  const { id } = await params
  const supabase = await createClient()

  const { data: flock } = await supabase
    .from('flocks')
    .select('*, poultry_houses(name, code)')
    .eq('id', id)
    .eq('farm_id', farm.id)
    .single()

  if (!flock) notFound()

  const house = flock.poultry_houses as { name: string; code: string | null } | null

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/flocks" className="btn-ghost p-2"><ArrowLeft size={18} /></Link>
        <div className="flex-1">
          <h1 className="page-title flex items-center gap-2">
            <Bird size={22} className="text-purple-500" /> {flock.flock_code}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">{farm.name}</p>
        </div>
        <Link href={`/flocks/${flock.id}/edit`} className="btn-primary flex items-center gap-2">
          <Pencil size={14} /> Edit Flock
        </Link>
      </div>

      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Flock Details</h2>
          <span className={cn('badge', statusColor(flock.status))}>{flock.status}</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-400 text-xs mb-1">Flock Code</p>
            <p className="font-semibold text-gray-900">{flock.flock_code}</p>
          </div>
          {flock.batch_number && (
            <div>
              <p className="text-gray-400 text-xs mb-1">Batch Number</p>
              <p className="font-medium text-gray-700">{flock.batch_number}</p>
            </div>
          )}
          {flock.breed_strain && (
            <div>
              <p className="text-gray-400 text-xs mb-1">Breed / Strain</p>
              <p className="font-medium text-gray-700">{flock.breed_strain}</p>
            </div>
          )}
          {flock.source && (
            <div>
              <p className="text-gray-400 text-xs mb-1">Source</p>
              <p className="font-medium text-gray-700">{flock.source}</p>
            </div>
          )}
          <div>
            <p className="text-gray-400 text-xs mb-1">Date Received</p>
            <p className="font-medium text-gray-700">{formatDate(flock.date_received)}</p>
          </div>
          {house && (
            <div>
              <p className="text-gray-400 text-xs mb-1">Poultry House</p>
              <p className="font-medium text-gray-700">{house.name}{house.code ? ` (${house.code})` : ''}</p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-400 mb-3">Population</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="stat-card">
              <span className="stat-label">Initial</span>
              <span className="stat-value">{flock.initial_population?.toLocaleString()}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Males</span>
              <span className="stat-value">{flock.initial_males ?? 0}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Females</span>
              <span className="stat-value">{flock.initial_females ?? 0}</span>
            </div>
          </div>
        </div>

        {(flock.production_start_date || flock.expected_end_date) && (
          <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-4 text-sm">
            {flock.production_start_date && (
              <div>
                <p className="text-gray-400 text-xs mb-1">Production Start</p>
                <p className="font-medium text-gray-700">{formatDate(flock.production_start_date)}</p>
              </div>
            )}
            {flock.expected_end_date && (
              <div>
                <p className="text-gray-400 text-xs mb-1">Expected End</p>
                <p className="font-medium text-gray-700">{formatDate(flock.expected_end_date)}</p>
              </div>
            )}
          </div>
        )}

        {flock.notes && (
          <div className="border-t border-gray-100 pt-4">
            <p className="text-gray-400 text-xs mb-1">Notes</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{flock.notes}</p>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Link href={`/flocks/${flock.id}/edit`} className="btn-primary flex items-center gap-2">
          <Pencil size={14} /> Edit This Flock
        </Link>
        <Link href="/flocks" className="btn-ghost">Back to Flocks</Link>
      </div>
    </div>
  )
}
