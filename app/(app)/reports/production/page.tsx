import { requireUser, getCurrentFarm } from '@/lib/session'
import { getDailyProduction } from '@/app/actions/production'
import { formatDate, formatPct, formatNumber } from '@/lib/utils'
import { Egg } from 'lucide-react'
import DownloadCSVButton from '@/components/reports/DownloadCSVButton'

export const metadata = { title: 'Production Report | LayerPro' }

export default async function ProductionReportPage() {
  await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) return <div className="p-6"><p className="text-gray-500">No farm found.</p></div>

  const records = await getDailyProduction(farm.id, 90)

  const totalEggs   = records.reduce((s, r) => s + (r.total_eggs || 0), 0)
  const totalGood   = records.reduce((s, r) => s + (r.good_eggs || 0), 0)
  const avgHdp      = records.reduce((s, r) => s + (r.hen_day_pct || 0), 0) / Math.max(1, records.length)
  const totalHens   = records.reduce((s, r) => s + (r.hens_present || 0), 0) / Math.max(1, records.length)

  const csvData = records.map(r => ({
    Date:           formatDate(r.record_date),
    Flock:          (r.flocks as {flock_code:string})?.flock_code ?? '',
    House:          (r.poultry_houses as {name:string})?.name ?? '',
    'Hens Present': r.hens_present,
    'Total Eggs':   r.total_eggs,
    'Good Eggs':    r.good_eggs,
    'Cracked':      r.cracked_eggs,
    'Dirty':        r.dirty_eggs,
    'Broken':       r.broken_eggs,
    'Rejected':     r.rejected_eggs,
    'HDP %':        formatPct(r.hen_day_pct ?? 0),
  }))

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Egg size={24} className="text-farm-green-600" /> Daily Production Report
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Last 90 days — {farm.name}</p>
        </div>
        <DownloadCSVButton data={csvData} filename="production-report" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Eggs (90d)',   value: formatNumber(totalEggs) },
          { label: 'Good Eggs (90d)',    value: formatNumber(totalGood) },
          { label: 'Avg. HDP %',         value: formatPct(avgHdp) },
          { label: 'Avg. Hens/Day',      value: formatNumber(Math.round(totalHens)) },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <span className="stat-label">{s.label}</span>
            <span className="stat-value">{s.value}</span>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Production Log</h3>
        {records.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No production records yet.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th><th>Flock</th><th>House</th><th>Hens</th>
                  <th>Total Eggs</th><th>Good Eggs</th><th>Cracked</th><th>Dirty</th><th>Rejected</th><th>HDP %</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id}>
                    <td>{formatDate(r.record_date)}</td>
                    <td>{(r.flocks as {flock_code:string})?.flock_code ?? '—'}</td>
                    <td>{(r.poultry_houses as {name:string})?.name ?? '—'}</td>
                    <td>{formatNumber(r.hens_present)}</td>
                    <td className="font-semibold">{formatNumber(r.total_eggs)}</td>
                    <td className="text-farm-green-700">{formatNumber(r.good_eggs)}</td>
                    <td className="text-amber-600">{r.cracked_eggs}</td>
                    <td className="text-amber-600">{r.dirty_eggs}</td>
                    <td className="text-red-600">{r.rejected_eggs}</td>
                    <td className="font-semibold text-farm-green-700">{formatPct(r.hen_day_pct ?? 0)}</td>
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
