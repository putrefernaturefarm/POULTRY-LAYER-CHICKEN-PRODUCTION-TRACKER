import { requireUser, getCurrentFarm } from '@/lib/session'
import { getDailyProduction } from '@/app/actions/production'
import { formatDate, formatPct, formatNumber, cn } from '@/lib/utils'
import { Egg, Plus, Pencil } from 'lucide-react'
import Link from 'next/link'

export default async function ProductionPage() {
  await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) return <div className="p-6"><p className="text-gray-500">No farm found.</p></div>

  const records = await getDailyProduction(farm.id, 60)

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Egg size={24} className="text-amber-500" /> Egg Production
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Daily egg collection records</p>
        </div>
        <Link href="/production/new" className="btn-primary">
          <Plus size={16} /> Record Eggs
        </Link>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold text-gray-900">Daily Production Records</h3>
          <span className="badge-amber">{records.length} records</span>
        </div>

        {records.length === 0 ? (
          <div className="text-center py-10">
            <Egg size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No production records yet</p>
            <Link href="/production/new" className="btn-primary mt-4 inline-flex">
              <Plus size={16} /> Record First Collection
            </Link>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Flock</th>
                  <th>Hens</th>
                  <th>Total Eggs</th>
                  <th>Good Eggs</th>
                  <th>HDP %</th>
                  <th>Good %</th>
                  <th>Losses</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => {
                  const losses = (r.cracked_eggs || 0) + (r.dirty_eggs || 0) + (r.broken_eggs || 0) + (r.rejected_eggs || 0)
                  return (
                    <tr key={r.id}>
                      <td className="whitespace-nowrap font-medium">{formatDate(r.record_date)}</td>
                      <td>{(r.flocks as { flock_code: string })?.flock_code ?? '—'}</td>
                      <td>{formatNumber(r.hens_present)}</td>
                      <td className="font-semibold">{formatNumber(r.total_eggs)}</td>
                      <td className="text-green-700">{formatNumber(r.good_eggs)}</td>
                      <td>
                        <span className={cn(
                          'font-medium',
                          r.hen_day_pct > 80 ? 'text-green-600' :
                          r.hen_day_pct > 60 ? 'text-amber-600' : 'text-red-600'
                        )}>
                          {formatPct(r.hen_day_pct ?? 0)}
                        </span>
                      </td>
                      <td>{formatPct(r.good_egg_pct ?? 0)}</td>
                      <td className={cn(losses > 0 ? 'text-red-600' : 'text-gray-400')}>
                        {losses > 0 ? formatNumber(losses) : '—'}
                      </td>
                      <td>
                        <Link href={`/production/${r.id}/edit`} className="text-blue-600 hover:underline text-xs font-medium flex items-center gap-1">
                          <Pencil size={11} /> Edit
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
