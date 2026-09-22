import { requireUser, getCurrentFarm } from '@/lib/session'
import { createClient } from '@/lib/supabase/server'
import { Activity } from 'lucide-react'
import { formatPct, formatNumber, formatDate } from '@/lib/utils'
import AnalyticsCharts from '@/components/dashboard/AnalyticsCharts'

export default async function AnalyticsPage() {
  await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) return <div className="p-6"><p className="text-gray-500">No farm found.</p></div>

  const supabase = await createClient()
  const since = new Date(); since.setDate(since.getDate() - 60)
  const sinceStr = since.toISOString().split('T')[0]

  const [{ data: prodData }, { data: morbData }, { data: mortData }] = await Promise.all([
    supabase.from('daily_production')
      .select('record_date, total_eggs, hen_day_pct, hens_present')
      .eq('farm_id', farm.id).gte('record_date', sinceStr)
      .order('record_date', { ascending: true }),
    supabase.from('morbidity_records')
      .select('record_date, num_affected, morbidity_rate')
      .eq('farm_id', farm.id).gte('record_date', sinceStr)
      .order('record_date', { ascending: true }),
    supabase.from('mortality_records')
      .select('record_date, num_deaths, mortality_rate')
      .eq('farm_id', farm.id).gte('record_date', sinceStr)
      .order('record_date', { ascending: true }),
  ])

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="page-title flex items-center gap-2">
          <Activity size={24} className="text-blue-500" /> Analytics
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">60-day production and health trends — {farm.name}</p>
      </div>

      <AnalyticsCharts
        production={(prodData ?? []).map(d => ({
          date: formatDate(d.record_date, 'MMM d'),
          eggs: d.total_eggs,
          hdp:  Number((d.hen_day_pct || 0).toFixed(1)),
        }))}
        morbidity={(morbData ?? []).map(d => ({
          date: formatDate(d.record_date, 'MMM d'),
          affected: d.num_affected,
          rate: Number((d.morbidity_rate || 0).toFixed(2)),
        }))}
        mortality={(mortData ?? []).map(d => ({
          date: formatDate(d.record_date, 'MMM d'),
          deaths: d.num_deaths,
          rate: Number((d.mortality_rate || 0).toFixed(2)),
        }))}
      />
    </div>
  )
}
