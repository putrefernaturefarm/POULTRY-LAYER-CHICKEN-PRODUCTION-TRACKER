import { requireUser, getCurrentFarm } from '@/lib/session'
import { getMortalityRecords, getMortalitySummary } from '@/app/actions/mortality'
import { formatDate, formatPct, formatNumber, cn } from '@/lib/utils'
import { Skull, Plus, Pencil } from 'lucide-react'
import Link from 'next/link'

export default async function MortalityPage() {
  await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) return <div className="p-6"><p className="text-gray-500">No farm found.</p></div>

  const [records, summary] = await Promise.all([
    getMortalityRecords(farm.id, 60),
    getMortalitySummary(farm.id),
  ])

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Skull size={24} className="text-red-500" /> Mortality Records
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Bird deaths — tracked separately from morbidity (sick birds)
          </p>
        </div>
        <Link href="/mortality/new" className="btn-primary"><Plus size={16} /> Log Mortality</Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="stat-card border-l-4 border-red-400">
          <span className="stat-label">Monthly Deaths</span>
          <span className="stat-value text-red-600">{summary.monthlyDeaths}</span>
          <span className="stat-sub">this month</span>
        </div>
        <div className="stat-card border-l-4 border-orange-400">
          <span className="stat-label">Mortality Rate</span>
          <span className="stat-value text-orange-600">{formatPct(summary.avgMortRate)}</span>
          <span className="stat-sub">avg this month</span>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold text-gray-900">Mortality Events</h3>
        </div>
        {records.length === 0 ? (
          <div className="text-center py-10">
            <Skull size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">No mortality records yet</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Flock</th>
                  <th>Deaths</th>
                  <th>Pop. at Risk</th>
                  <th>Mortality Rate</th>
                  <th>Cause</th>
                  <th>Disposal</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id}>
                    <td className="whitespace-nowrap">{formatDate(r.record_date)}</td>
                    <td>{(r.flocks as {flock_code:string})?.flock_code ?? '—'}</td>
                    <td className="font-bold text-red-600">{r.num_deaths}</td>
                    <td>{formatNumber(r.population_at_risk)}</td>
                    <td>
                      <span className={cn('font-medium', r.mortality_rate > 5 ? 'text-red-600' : r.mortality_rate > 2 ? 'text-amber-600' : 'text-gray-700')}>
                        {formatPct(r.mortality_rate ?? 0)}
                      </span>
                    </td>
                    <td>{r.suspected_cause ?? '—'}</td>
                    <td>{r.disposal_method ?? '—'}</td>
                    <td>
                      <Link href={`/mortality/${r.id}/edit`} className="text-blue-600 hover:underline text-xs font-medium flex items-center gap-1">
                        <Pencil size={11} /> Edit
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
