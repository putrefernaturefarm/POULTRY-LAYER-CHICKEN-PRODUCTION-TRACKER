import { requireUser, getCurrentFarm } from '@/lib/session'
import { getMorbidityRecords, getMorbiditySummary, deleteMorbidity } from '@/app/actions/morbidity'
import { formatDate, formatPct, formatNumber, statusColor, cn } from '@/lib/utils'
import { AlertTriangle, Plus, Activity, Heart, UserCheck, UserX } from 'lucide-react'
import Link from 'next/link'
import DeleteButton from '@/components/shared/DeleteButton'

export default async function MorbidityPage() {
  await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) return <div className="p-6"><p className="text-gray-500">No farm found.</p></div>

  const [records, summary] = await Promise.all([
    getMorbidityRecords(farm.id, 50),
    getMorbiditySummary(farm.id),
  ])

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <AlertTriangle size={24} className="text-amber-500" /> Morbidity Records
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Birds showing illness signs or affected by disease — distinct from mortality (deaths)
          </p>
        </div>
        <Link href="/morbidity/new" className="btn-primary">
          <Plus size={16} /> Log Morbidity
        </Link>
      </div>

      {/* Clarification banner */}
      <div className="alert-info flex items-start gap-2">
        <AlertTriangle size={16} className="mt-0.5 shrink-0 text-blue-600" />
        <p className="text-sm">
          <strong>Morbidity ≠ Mortality.</strong> Morbidity records birds that are <em>sick or affected</em>.
          Mortality records birds that have <em>died</em>. Track them separately for accurate farm health reporting.
        </p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="stat-card border-l-4 border-amber-400">
          <span className="stat-label">Morbidity Rate</span>
          <span className="stat-value text-amber-600">{formatPct(summary.avgMorbRate)}</span>
          <span className="stat-sub">avg active cases</span>
        </div>
        <div className="stat-card border-l-4 border-red-400">
          <span className="stat-label">Affected Birds</span>
          <span className="stat-value text-red-600">{formatNumber(summary.totalAffected)}</span>
          <span className="stat-sub">total in active cases</span>
        </div>
        <div className="stat-card border-l-4 border-blue-400">
          <span className="stat-label">Under Treatment</span>
          <span className="stat-value text-blue-600">{formatNumber(summary.totalUnderTreatment)}</span>
          <span className="stat-sub">birds on medication</span>
        </div>
        <div className="stat-card border-l-4 border-green-400">
          <span className="stat-label">Recovered</span>
          <span className="stat-value text-green-600">{formatNumber(summary.totalRecovered)}</span>
          <span className="stat-sub">birds recovered</span>
        </div>
      </div>

      {/* Records table */}
      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold text-gray-900">Morbidity Events</h3>
          <span className="badge-amber">{records.length} records</span>
        </div>

        {records.length === 0 ? (
          <div className="text-center py-10">
            <Heart size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No morbidity records yet</p>
            <p className="text-gray-400 text-sm mt-1">Log a health event when birds show signs of illness.</p>
            <Link href="/morbidity/new" className="btn-primary mt-4 inline-flex">
              <Plus size={16} /> Log First Event
            </Link>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Flock</th>
                  <th>Condition</th>
                  <th>Affected</th>
                  <th>Morb. Rate</th>
                  <th>Recovered</th>
                  <th>Died</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id}>
                    <td className="whitespace-nowrap">{formatDate(r.record_date)}</td>
                    <td className="font-medium">{(r.flocks as { flock_code: string })?.flock_code ?? '—'}</td>
                    <td>{r.condition_disease}</td>
                    <td>
                      <span className="font-semibold text-amber-700">{r.num_affected}</span>
                      <span className="text-gray-400 text-xs"> / {r.population_at_risk}</span>
                    </td>
                    <td>
                      <span className={cn(
                        'font-medium',
                        r.morbidity_rate > 10 ? 'text-red-600' :
                        r.morbidity_rate > 5  ? 'text-amber-600' : 'text-gray-700'
                      )}>
                        {formatPct(r.morbidity_rate ?? 0)}
                      </span>
                    </td>
                    <td className="text-green-700">{r.num_recovered}</td>
                    <td className="text-red-600">{r.num_subsequently_died}</td>
                    <td>
                      <span className={cn(
                        'badge',
                        r.is_resolved ? 'badge-green' : 'badge-amber'
                      )}>
                        {r.is_resolved ? 'Resolved' : 'Active'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <Link href={`/morbidity/${r.id}`} className="text-xs font-medium" style={{ color: 'var(--green)' }}>
                          Update
                        </Link>
                        <DeleteButton action={deleteMorbidity.bind(null, r.id)} label="morbidity record" />
                      </div>
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
