import { requireUser, getCurrentFarm } from '@/lib/session'
import { getMortalityRecords } from '@/app/actions/mortality'
import { formatDate, formatPct, formatNumber, cn } from '@/lib/utils'
import { Skull } from 'lucide-react'
import DownloadCSVButton from '@/components/reports/DownloadCSVButton'

export const metadata = { title: 'Mortality Report | LayerPro' }

export default async function MortalityReportPage() {
  await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) return <div className="p-6"><p className="text-gray-500">No farm found.</p></div>

  const records = await getMortalityRecords(farm.id, 90)

  const totalDeaths  = records.reduce((s, r) => s + (r.num_deaths || 0), 0)
  const avgMortRate  = records.reduce((s, r) => s + (r.mortality_rate || 0), 0) / Math.max(1, records.length)

  const byCause: Record<string, number> = {}
  records.forEach(r => { if (r.suspected_cause) byCause[r.suspected_cause] = (byCause[r.suspected_cause] || 0) + r.num_deaths })
  const topCauses = Object.entries(byCause).sort((a,b)=>b[1]-a[1]).slice(0,5)

  const csvData = records.map(r => ({
    Date:              formatDate(r.record_date),
    Flock:             (r.flocks as {flock_code:string})?.flock_code ?? '',
    House:             (r.poultry_houses as {name:string})?.name ?? '',
    'Population at Risk': r.population_at_risk,
    Deaths:            r.num_deaths,
    'Mortality Rate':  formatPct(r.mortality_rate ?? 0),
    'Suspected Cause': r.suspected_cause ?? '',
    'Disposal Method': r.disposal_method ?? '',
    Notes:             r.notes ?? '',
  }))

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Skull size={24} className="text-red-600" /> Mortality Report
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Last 90 days — {farm.name}</p>
        </div>
        <DownloadCSVButton data={csvData} filename="mortality-report" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { label: 'Total Deaths (90d)',    value: formatNumber(totalDeaths), color: 'text-red-600' },
          { label: 'Avg. Mortality Rate',   value: formatPct(avgMortRate),    color: 'text-red-600' },
          { label: 'Total Records',         value: formatNumber(records.length), color: '' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <span className="stat-label">{s.label}</span>
            <span className={cn('stat-value', s.color)}>{s.value}</span>
          </div>
        ))}
      </div>

      {topCauses.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Top Causes of Death</h3>
          <div className="space-y-2">
            {topCauses.map(([cause, count]) => (
              <div key={cause} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 w-48 truncate">{cause}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div className="bg-red-400 h-2 rounded-full" style={{ width: `${totalDeaths > 0 ? (count/totalDeaths*100).toFixed(0) : 0}%` }} />
                </div>
                <span className="text-sm font-bold text-red-700 w-20 text-right">{formatNumber(count)} birds</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Mortality Event Log</h3>
        {records.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No mortality records yet.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th><th>Flock</th><th>House</th><th>Pop. at Risk</th>
                  <th>Deaths</th><th>Rate</th><th>Suspected Cause</th><th>Disposal</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id}>
                    <td>{formatDate(r.record_date)}</td>
                    <td>{(r.flocks as {flock_code:string})?.flock_code ?? '—'}</td>
                    <td>{(r.poultry_houses as {name:string})?.name ?? '—'}</td>
                    <td>{formatNumber(r.population_at_risk)}</td>
                    <td className="font-semibold text-red-600">{r.num_deaths}</td>
                    <td>{formatPct(r.mortality_rate ?? 0)}</td>
                    <td>{r.suspected_cause || '—'}</td>
                    <td>{r.disposal_method || '—'}</td>
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
