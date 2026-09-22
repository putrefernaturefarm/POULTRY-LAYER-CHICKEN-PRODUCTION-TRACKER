import { requireUser, getCurrentFarm } from '@/lib/session'
import { getDailyProduction } from '@/app/actions/production'
import { deleteProduction } from '@/app/actions/production'
import { formatDate, formatPct, formatNumber, cn } from '@/lib/utils'
import { Egg, Plus, Pencil } from 'lucide-react'
import Link from 'next/link'
import DeleteButton from '@/components/shared/DeleteButton'

export const metadata = { title: 'Egg Production | LayerPro' }

export default async function ProductionPage() {
  await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) return <div className="p-6"><p style={{ color: 'var(--ink-soft)' }}>No farm found.</p></div>

  const records = await getDailyProduction(farm.id, 60)

  const today      = new Date().toISOString().split('T')[0]
  const monthStart = today.slice(0, 7) + '-01'

  const todayRec  = records.filter(r => r.record_date === today)
  const monthRec  = records.filter(r => r.record_date >= monthStart)

  const todayEggs = todayRec.reduce((s, r) => s + (r.total_eggs || 0), 0)
  const monthEggs = monthRec.reduce((s, r) => s + (r.total_eggs || 0), 0)
  const avgHdp    = monthRec.length
    ? monthRec.reduce((s, r) => s + (r.hen_day_pct || 0), 0) / monthRec.length
    : 0
  const avgHens   = monthRec.length
    ? Math.round(monthRec.reduce((s, r) => s + (r.hens_present || 0), 0) / monthRec.length)
    : 0

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Egg size={22} style={{ color: 'var(--amber)' }} /> Egg Production
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--ink-soft)' }}>Daily egg collection — {farm.name}</p>
        </div>
        <Link href="/production/new" className="btn-primary">
          <Plus size={16} /> Record Eggs
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="stat-card" style={{ borderLeft: '4px solid var(--amber)' }}>
          <span className="stat-label">Today&apos;s Eggs</span>
          <span className="stat-value" style={{ color: 'var(--amber)' }}>
            {todayEggs > 0 ? formatNumber(todayEggs) : '—'}
          </span>
          <span className="stat-sub">collected today</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Month Total</span>
          <span className="stat-value">{formatNumber(monthEggs)}</span>
          <span className="stat-sub">eggs this month</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Avg HDP</span>
          <span
            className="stat-value"
            style={{ color: avgHdp > 80 ? 'var(--green)' : avgHdp > 60 ? 'var(--amber)' : 'var(--red)' }}
          >
            {monthRec.length ? formatPct(avgHdp) : '—'}
          </span>
          <span className="stat-sub">hen-day production</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Avg Flock Size</span>
          <span className="stat-value">{avgHens > 0 ? formatNumber(avgHens) : '—'}</span>
          <span className="stat-sub">hens / day this month</span>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold" style={{ color: 'var(--ink)' }}>Daily Production Records</h3>
          <span className="badge-gray">{records.length} records</span>
        </div>

        {records.length === 0 ? (
          <div className="text-center py-12">
            <Egg size={40} style={{ color: 'var(--line-strong)', margin: '0 auto 12px' }} />
            <p className="font-semibold" style={{ color: 'var(--ink-soft)' }}>No production records yet</p>
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
                  const deleteAction = deleteProduction.bind(null, r.id)
                  return (
                    <tr key={r.id}>
                      <td className="whitespace-nowrap font-medium">{formatDate(r.record_date)}</td>
                      <td>{(r.flocks as { flock_code: string })?.flock_code ?? '—'}</td>
                      <td>{formatNumber(r.hens_present)}</td>
                      <td className="font-semibold">{formatNumber(r.total_eggs)}</td>
                      <td style={{ color: 'var(--green)' }}>{formatNumber(r.good_eggs)}</td>
                      <td>
                        <span
                          className="font-medium"
                          style={{
                            color: r.hen_day_pct > 80 ? 'var(--green)' :
                                   r.hen_day_pct > 60 ? 'var(--amber)' : 'var(--red)'
                          }}
                        >
                          {formatPct(r.hen_day_pct ?? 0)}
                        </span>
                      </td>
                      <td>{formatPct(r.good_egg_pct ?? 0)}</td>
                      <td style={{ color: losses > 0 ? 'var(--red)' : 'var(--ink-muted)' }}>
                        {losses > 0 ? formatNumber(losses) : '—'}
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/production/${r.id}/edit`}
                            className="text-xs font-medium flex items-center gap-1"
                            style={{ color: 'var(--green)' }}
                          >
                            <Pencil size={11} /> Edit
                          </Link>
                          <DeleteButton action={deleteAction} label="production record" />
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
