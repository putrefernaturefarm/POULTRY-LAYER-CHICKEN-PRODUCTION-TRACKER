import { requireUser, getCurrentFarm } from '@/lib/session'
import { createClient } from '@/lib/supabase/server'
import { formatDate, formatPct, formatNumber, cn } from '@/lib/utils'
import { AlertTriangle } from 'lucide-react'
import MorbidityChart from '@/components/morbidity/MorbidityChart'

export default async function MorbidityReportPage() {
  await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) return <div className="p-6"><p className="text-gray-500">No farm found.</p></div>

  const supabase = await createClient()

  // Last 30 days
  const since = new Date(); since.setDate(since.getDate() - 30)
  const sinceStr = since.toISOString().split('T')[0]

  const { data: records } = await supabase
    .from('morbidity_records')
    .select('*, flocks(flock_code)')
    .eq('farm_id', farm.id)
    .gte('record_date', sinceStr)
    .order('record_date', { ascending: true })

  const rows = records ?? []
  const totalAffected   = rows.reduce((s, r) => s + r.num_affected, 0)
  const totalRecovered  = rows.reduce((s, r) => s + r.num_recovered, 0)
  const totalDied       = rows.reduce((s, r) => s + r.num_subsequently_died, 0)
  const totalCulled     = rows.reduce((s, r) => s + r.num_culled, 0)
  const avgMorbRate     = rows.reduce((s, r) => s + (r.morbidity_rate || 0), 0) / Math.max(1, rows.length)

  // Top conditions
  const byCondition: Record<string, number> = {}
  rows.forEach(r => { byCondition[r.condition_disease] = (byCondition[r.condition_disease] || 0) + r.num_affected })
  const topConditions = Object.entries(byCondition).sort((a,b)=>b[1]-a[1]).slice(0,5)

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="page-title flex items-center gap-2">
          <AlertTriangle size={24} className="text-amber-500" /> Morbidity Report
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Last 30 days — {farm.name}</p>
      </div>

      <div className="alert-info text-sm">
        <strong>Definition:</strong> Morbidity refers to the number or proportion of birds showing signs of illness
        or affected by a disease/condition. It is <em>not</em> the same as mortality (deaths).
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Avg. Morbidity Rate', value: formatPct(avgMorbRate), color: 'amber' },
          { label: 'Total Affected Birds', value: formatNumber(totalAffected), color: 'red' },
          { label: 'Recovered', value: formatNumber(totalRecovered), color: 'green' },
          { label: 'Subsequently Died', value: formatNumber(totalDied), color: 'red' },
          { label: 'Culled (from illness)', value: formatNumber(totalCulled), color: 'orange' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <span className="stat-label">{s.label}</span>
            <span className={cn('stat-value', s.color === 'red' ? 'text-red-600' : s.color === 'green' ? 'text-green-600' : s.color === 'amber' ? 'text-amber-600' : 'text-gray-900')}>
              {s.value}
            </span>
          </div>
        ))}
      </div>

      {/* Morbidity → Outcome Flow */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Morbidity → Outcome Flow</h3>
        <div className="flex flex-wrap gap-4 items-center text-sm">
          {[
            { label: 'Affected', value: totalAffected, color: 'bg-amber-100 text-amber-800' },
            { label: '→ Recovered', value: totalRecovered, color: 'bg-green-100 text-green-800' },
            { label: '→ Culled', value: totalCulled, color: 'bg-orange-100 text-orange-800' },
            { label: '→ Died', value: totalDied, color: 'bg-red-100 text-red-800' },
          ].map(item => (
            <div key={item.label} className={cn('px-4 py-2 rounded-xl font-medium', item.color)}>
              {item.label}: <strong>{formatNumber(item.value)}</strong>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Note: Totals may not be mutually exclusive if birds were counted in multiple events.
          Recovered + Culled + Died may not equal total Affected if outcomes are still pending.
        </p>
      </div>

      {/* Chart */}
      <MorbidityChart data={rows.map(r => ({
        date: formatDate(r.record_date, 'MMM d'),
        affected: r.num_affected,
        rate: Number((r.morbidity_rate || 0).toFixed(2)),
      }))} />

      {/* Top Conditions */}
      {topConditions.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Top Recorded Conditions (30 days)</h3>
          <div className="space-y-2">
            {topConditions.map(([cond, count]) => (
              <div key={cond} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 w-48 truncate">{cond}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div className="bg-amber-400 h-2 rounded-full" style={{ width: `${(count/totalAffected*100).toFixed(0)}%` }} />
                </div>
                <span className="text-sm font-bold text-amber-700 w-20 text-right">{formatNumber(count)} birds</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed table */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Morbidity Event Log</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Date</th><th>Flock</th><th>Condition</th><th>Affected</th>
                <th>Rate</th><th>Recovered</th><th>Died</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td>{formatDate(r.record_date)}</td>
                  <td>{(r.flocks as {flock_code:string})?.flock_code ?? '—'}</td>
                  <td>{r.condition_disease}</td>
                  <td className="font-semibold text-amber-700">{r.num_affected}</td>
                  <td>{formatPct(r.morbidity_rate ?? 0)}</td>
                  <td className="text-green-600">{r.num_recovered}</td>
                  <td className="text-red-600">{r.num_subsequently_died}</td>
                  <td>
                    <span className={cn('badge', r.is_resolved ? 'badge-green' : 'badge-amber')}>
                      {r.is_resolved ? 'Resolved' : 'Active'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
