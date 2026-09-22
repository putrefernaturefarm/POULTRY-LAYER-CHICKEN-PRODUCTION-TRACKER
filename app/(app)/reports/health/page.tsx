import { requireUser, getCurrentFarm } from '@/lib/session'
import { createClient } from '@/lib/supabase/server'
import { formatDate, formatPct, formatNumber } from '@/lib/utils'
import { ClipboardList } from 'lucide-react'
import DownloadCSVButton from '@/components/reports/DownloadCSVButton'

export const metadata = { title: 'Health Summary | LayerPro' }

export default async function HealthSummaryReportPage() {
  await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) return <div className="p-6"><p className="text-gray-500">No farm found.</p></div>

  const supabase = await createClient()
  const since = new Date(); since.setDate(since.getDate() - 30)
  const sinceStr = since.toISOString().split('T')[0]

  const [{ data: morbRows }, { data: mortRows }] = await Promise.all([
    supabase.from('morbidity_records').select('*').eq('farm_id', farm.id).gte('record_date', sinceStr).order('record_date', { ascending: false }),
    supabase.from('mortality_records').select('*').eq('farm_id', farm.id).gte('record_date', sinceStr).order('record_date', { ascending: false }),
  ])

  const morb = morbRows ?? []
  const mort = mortRows ?? []

  const totalAffected = morb.reduce((s, r) => s + r.num_affected, 0)
  const totalDeaths   = mort.reduce((s, r) => s + r.num_deaths, 0)
  const avgMorbRate   = morb.reduce((s, r) => s + (r.morbidity_rate || 0), 0) / Math.max(1, morb.length)
  const avgMortRate   = mort.reduce((s, r) => s + (r.mortality_rate || 0), 0) / Math.max(1, mort.length)
  const activeMorb    = morb.filter(r => !r.is_resolved).length

  const csvData = [
    ...morb.map(r => ({
      Type:     'Morbidity',
      Date:     formatDate(r.record_date),
      Event:    r.condition_disease,
      'Birds Affected': r.num_affected,
      Rate:     formatPct(r.morbidity_rate ?? 0),
      Outcome:  r.is_resolved ? 'Resolved' : 'Active',
    })),
    ...mort.map(r => ({
      Type:     'Mortality',
      Date:     formatDate(r.record_date),
      Event:    r.suspected_cause ?? '',
      'Birds Affected': r.num_deaths,
      Rate:     formatPct(r.mortality_rate ?? 0),
      Outcome:  'Death',
    })),
  ]

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <ClipboardList size={24} className="text-farm-green-600" /> Health Summary
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Last 30 days — {farm.name}</p>
        </div>
        <DownloadCSVButton data={csvData} filename="health-summary" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Birds Affected (Morb.)', value: formatNumber(totalAffected), color: 'text-amber-600' },
          { label: 'Active Morbidity Cases', value: formatNumber(activeMorb),    color: 'text-amber-600' },
          { label: 'Total Deaths',           value: formatNumber(totalDeaths),   color: 'text-red-600' },
          { label: 'Avg. Mortality Rate',    value: formatPct(avgMortRate),      color: 'text-red-600' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <span className="stat-label">{s.label}</span>
            <span className={`stat-value ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Morbidity Events (30d)</h3>
          {morb.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No morbidity records.</p>
          ) : (
            <div className="space-y-2">
              {morb.slice(0,10).map(r => (
                <div key={r.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{r.condition_disease}</p>
                    <p className="text-xs text-gray-400">{formatDate(r.record_date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-amber-700">{r.num_affected} birds</p>
                    <p className="text-xs text-gray-400">{formatPct(r.morbidity_rate ?? 0)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Mortality Events (30d)</h3>
          {mort.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No mortality records.</p>
          ) : (
            <div className="space-y-2">
              {mort.slice(0,10).map(r => (
                <div key={r.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{r.suspected_cause || 'Unknown cause'}</p>
                    <p className="text-xs text-gray-400">{formatDate(r.record_date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-700">{r.num_deaths} deaths</p>
                    <p className="text-xs text-gray-400">{formatPct(r.mortality_rate ?? 0)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
