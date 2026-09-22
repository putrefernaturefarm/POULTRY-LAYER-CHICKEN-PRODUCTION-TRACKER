import { requireUser, getCurrentFarm } from '@/lib/session'
import { getCullingRecords, getCullingSummary, deleteCullingRecord } from '@/app/actions/culling'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Scissors, Plus, Pencil } from 'lucide-react'
import Link from 'next/link'
import { CULLING_REASONS, DISPOSAL_METHODS } from '@/lib/constants'
import DeleteButton from '@/components/shared/DeleteButton'

export const metadata = { title: 'Culling | LayerPro' }

export default async function CullingPage() {
  await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) return <div className="p-6"><p style={{ color: 'var(--ink-soft)' }}>No farm found.</p></div>

  const [records, summary] = await Promise.all([
    getCullingRecords(farm.id),
    getCullingSummary(farm.id),
  ])

  const reasonLabel   = (v: string) => CULLING_REASONS.find(r => r.value === v)?.label ?? v
  const disposalLabel = (v: string) => DISPOSAL_METHODS.find(d => d.value === v)?.label ?? v

  const topReason = Object.entries(summary.byReason).sort((a, b) => (b[1] as number) - (a[1] as number))[0]

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Scissors size={22} style={{ color: 'var(--ink-soft)' }} /> Culling Records
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--ink-soft)' }}>{farm.name}</p>
        </div>
        <Link href="/culling/new" className="btn-primary"><Plus size={16} /> Log Culling</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="stat-card" style={{ borderLeft: '4px solid var(--ink-soft)' }}>
          <span className="stat-label">Culled (Month)</span>
          <span className="stat-value">{summary.totalCulled}</span>
          <span className="stat-sub">birds removed</span>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--green)' }}>
          <span className="stat-label">Revenue</span>
          <span className="stat-value" style={{ color: 'var(--green)' }}>
            {summary.totalRevenue > 0 ? formatCurrency(summary.totalRevenue) : '—'}
          </span>
          <span className="stat-sub">from culled birds</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Top Reason</span>
          <span className="stat-value text-base">{topReason ? reasonLabel(topReason[0]) : '—'}</span>
          <span className="stat-sub">{topReason ? `${topReason[1]} birds` : 'this month'}</span>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold" style={{ color: 'var(--ink)' }}>Culling Records</h3>
          <span className="badge-gray">{records.length} records</span>
        </div>
        {records.length === 0 ? (
          <div className="text-center py-12">
            <Scissors size={40} style={{ color: 'var(--line-strong)', margin: '0 auto 12px' }} />
            <p className="font-semibold" style={{ color: 'var(--ink-soft)' }}>No culling records yet</p>
            <p className="text-sm mt-1 mb-5" style={{ color: 'var(--ink-muted)' }}>
              Record birds removed from the flock due to poor performance, injury, or disease.
            </p>
            <Link href="/culling/new" className="btn-primary inline-flex">
              <Plus size={16} /> Log First Culling
            </Link>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Flock</th>
                  <th>No. Culled</th>
                  <th>Reason</th>
                  <th>Disposal</th>
                  <th>Revenue</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id}>
                    <td className="whitespace-nowrap">{formatDate(r.culling_date)}</td>
                    <td style={{ color: 'var(--ink-soft)' }}>{(r.flocks as { flock_code: string })?.flock_code ?? '—'}</td>
                    <td className="font-bold">{r.num_culled}</td>
                    <td>{r.reason ? <span className="badge-gray">{reasonLabel(r.reason)}</span> : '—'}</td>
                    <td style={{ color: 'var(--ink-soft)' }}>{r.disposal_method ? disposalLabel(r.disposal_method) : '—'}</td>
                    <td style={{ color: 'var(--green)' }}>{r.revenue ? formatCurrency(r.revenue) : '—'}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <Link href={`/culling/${r.id}/edit`} className="text-xs font-medium flex items-center gap-1" style={{ color: 'var(--green)' }}>
                          <Pencil size={11} /> Edit
                        </Link>
                        <DeleteButton action={deleteCullingRecord.bind(null, r.id)} label="culling record" />
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
