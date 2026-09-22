import { requireUser, getCurrentFarm } from '@/lib/session'
import { getWaterRecords, getWaterSummary, deleteWaterRecord } from '@/app/actions/water'
import { formatDate } from '@/lib/utils'
import { Droplets, Plus, Pencil } from 'lucide-react'
import Link from 'next/link'
import DeleteButton from '@/components/shared/DeleteButton'

export const metadata = { title: 'Water Consumption | LayerPro' }

export default async function WaterPage() {
  await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) return <div className="p-6"><p style={{ color: 'var(--ink-soft)' }}>No farm found.</p></div>

  const [records, summary] = await Promise.all([
    getWaterRecords(farm.id),
    getWaterSummary(farm.id),
  ])

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Droplets size={22} style={{ color: '#3b9fe8' }} /> Water Consumption
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--ink-soft)' }}>{farm.name}</p>
        </div>
        <Link href="/water/new" className="btn-primary"><Plus size={16} /> Log Water</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="stat-card" style={{ borderLeft: '4px solid #3b9fe8' }}>
          <span className="stat-label">Month Total</span>
          <span className="stat-value" style={{ color: '#3b9fe8' }}>{summary.totalLiters.toFixed(0)} L</span>
          <span className="stat-sub">this month</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Avg / Bird / Day</span>
          <span className="stat-value">{summary.avgPerBird > 0 ? `${summary.avgPerBird.toFixed(2)} L` : '—'}</span>
          <span className="stat-sub">liters per hen</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Records</span>
          <span className="stat-value">{summary.recordCount}</span>
          <span className="stat-sub">this month</span>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold" style={{ color: 'var(--ink)' }}>Water Records</h3>
          <span className="badge-gray">{records.length} records</span>
        </div>
        {records.length === 0 ? (
          <div className="text-center py-14">
            <Droplets size={40} style={{ color: 'var(--line-strong)', margin: '0 auto 12px' }} />
            <p className="font-semibold" style={{ color: 'var(--ink-soft)' }}>No water records yet</p>
            <p className="text-sm mt-1 mb-5" style={{ color: 'var(--ink-muted)' }}>
              Track daily water consumption to monitor bird health and system performance.
            </p>
            <Link href="/water/new" className="btn-primary inline-flex">
              <Plus size={16} /> Log First Record
            </Link>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Flock</th>
                  <th>Morning (L)</th>
                  <th>Afternoon (L)</th>
                  <th>Total (L)</th>
                  <th>Per Bird</th>
                  <th>Source</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => {
                  const perBird = r.hens_present && r.hens_present > 0
                    ? (r.total_liters / r.hens_present).toFixed(2)
                    : null
                  return (
                    <tr key={r.id}>
                      <td className="whitespace-nowrap font-medium">{formatDate(r.record_date)}</td>
                      <td style={{ color: 'var(--ink-soft)' }}>{(r.flocks as { flock_code: string })?.flock_code ?? '—'}</td>
                      <td>{r.morning_liters ?? '—'}</td>
                      <td>{r.afternoon_liters ?? '—'}</td>
                      <td className="font-semibold" style={{ color: '#3b9fe8' }}>{Number(r.total_liters).toFixed(1)}</td>
                      <td style={{ color: 'var(--ink-soft)' }}>{perBird ? `${perBird} L` : '—'}</td>
                      <td style={{ color: 'var(--ink-muted)' }}>{r.water_source || '—'}</td>
                      <td>
                        <div className="flex items-center gap-3">
                          <Link href={`/water/${r.id}/edit`} className="text-xs font-medium flex items-center gap-1" style={{ color: 'var(--green)' }}>
                            <Pencil size={11} /> Edit
                          </Link>
                          <DeleteButton action={deleteWaterRecord.bind(null, r.id)} label="water record" />
                        </div>
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
