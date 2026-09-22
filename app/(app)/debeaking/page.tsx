import { requireUser, getCurrentFarm } from '@/lib/session'
import { getDebeakingRecords, deleteDebeakingRecord } from '@/app/actions/debeaking'
import { formatDate } from '@/lib/utils'
import { Scissors, Plus } from 'lucide-react'
import Link from 'next/link'
import DeleteButton from '@/components/shared/DeleteButton'

export const metadata = { title: 'Debeaking | LayerPro' }

const METHOD_LABELS: Record<string, string> = {
  hot_blade:  'Hot Blade',
  infrared:   'Infrared',
  precision:  'Precision',
  manual:     'Manual',
}

export default async function DebeakingPage() {
  await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) return <div className="p-6"><p style={{ color: 'var(--ink-soft)' }}>No farm found.</p></div>

  const records = await getDebeakingRecords(farm.id)

  const totalBirds   = records.reduce((s, r) => s + (r.num_birds || 0), 0)
  const thisMonth    = records.filter(r => r.debeaking_date?.slice(0, 7) === new Date().toISOString().slice(0, 7))
  const monthBirds   = thisMonth.reduce((s, r) => s + (r.num_birds || 0), 0)

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="page-title flex items-center gap-2">
          <Scissors size={22} style={{ color: 'var(--amber)' }} /> Debeaking Records
        </h1>
        <Link href="/debeaking/new" className="btn-primary"><Plus size={14} /> Log Debeaking</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="stat-card" style={{ borderLeft: '4px solid var(--amber)' }}>
          <span className="stat-label">Total Birds (All Time)</span>
          <span className="stat-value" style={{ color: 'var(--amber)' }}>{totalBirds.toLocaleString()}</span>
          <span className="stat-sub">{records.length} sessions</span>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--green)' }}>
          <span className="stat-label">This Month</span>
          <span className="stat-value" style={{ color: 'var(--green)' }}>{monthBirds.toLocaleString()}</span>
          <span className="stat-sub">{thisMonth.length} sessions</span>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--ink-soft)' }}>
          <span className="stat-label">Total Sessions</span>
          <span className="stat-value">{records.length}</span>
          <span className="stat-sub">all recorded</span>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {records.length === 0 ? (
          <div className="text-center py-12">
            <Scissors size={40} className="mx-auto mb-3" style={{ color: 'var(--line-strong)' }} />
            <p className="font-medium" style={{ color: 'var(--ink-soft)' }}>No debeaking records yet</p>
            <Link href="/debeaking/new" className="btn-primary mt-4 inline-flex"><Plus size={14} /> Log First Session</Link>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Flock</th>
                  <th>House</th>
                  <th>Birds</th>
                  <th>Age (wks)</th>
                  <th>Method</th>
                  <th>Done By</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id}>
                    <td className="font-semibold" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                      {formatDate(r.debeaking_date)}
                    </td>
                    <td>{(r.flocks as { flock_code: string })?.flock_code ?? '—'}</td>
                    <td>{(r.poultry_houses as { name: string })?.name ?? '—'}</td>
                    <td className="font-bold" style={{ color: 'var(--amber)' }}>{r.num_birds?.toLocaleString()}</td>
                    <td>{r.age_weeks != null ? `${r.age_weeks}w` : '—'}</td>
                    <td>{r.method ? (METHOD_LABELS[r.method] ?? r.method) : '—'}</td>
                    <td>{r.administered_by ?? '—'}</td>
                    <td className="text-xs" style={{ color: 'var(--ink-muted)', maxWidth: 160 }}>
                      <span className="truncate block">{r.notes ?? '—'}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <Link href={`/debeaking/${r.id}/edit`} className="text-xs font-medium" style={{ color: 'var(--green)' }}>Edit</Link>
                        <DeleteButton action={deleteDebeakingRecord.bind(null, r.id)} label="debeaking record" />
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
