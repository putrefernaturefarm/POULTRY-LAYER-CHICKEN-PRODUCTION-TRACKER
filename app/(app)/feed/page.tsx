import { requireUser, getCurrentFarm } from '@/lib/session'
import { getFeedRecords, getFeedSummary, deleteFeedRecord } from '@/app/actions/feed'
import { formatDate, formatCurrency } from '@/lib/utils'
import { UtensilsCrossed, Plus, Pencil } from 'lucide-react'
import Link from 'next/link'
import { FEED_TYPES } from '@/lib/constants'
import DeleteButton from '@/components/shared/DeleteButton'

export const metadata = { title: 'Feed Management | LayerPro' }

export default async function FeedPage() {
  await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) return <div className="p-6"><p style={{ color: 'var(--ink-soft)' }}>No farm found.</p></div>

  const [records, summary] = await Promise.all([
    getFeedRecords(farm.id),
    getFeedSummary(farm.id),
  ])

  const feedLabel = (val: string) => FEED_TYPES.find(f => f.value === val)?.label ?? val

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title flex items-center gap-2">
          <UtensilsCrossed size={22} style={{ color: 'var(--amber)' }} />
          Feed Management
        </h1>
        <Link href="/feed/new" className="btn-primary">
          <Plus size={16} /> Log Feed
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="stat-card" style={{ borderLeft: '4px solid var(--amber)' }}>
          <span className="stat-label">Month Total Cost</span>
          <span className="stat-value" style={{ color: 'var(--amber)' }}>
            {formatCurrency(summary.totalCost)}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Consumed (kg)</span>
          <span className="stat-value">{summary.totalKg.toFixed(1)} kg</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Avg Feed/Bird/Day</span>
          <span className="stat-value">{summary.avgFeedPerBird.toFixed(0)} g</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Records This Month</span>
          <span className="stat-value">{summary.recordCount}</span>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold" style={{ color: 'var(--ink)' }}>Feed Records</h3>
        </div>
        {records.length === 0 ? (
          <div className="text-center py-14">
            <UtensilsCrossed size={40} style={{ color: 'var(--line-strong)', margin: '0 auto 12px' }} />
            <p className="font-semibold" style={{ color: 'var(--ink-soft)' }}>No feed records yet</p>
            <p className="text-sm mt-1 mb-5" style={{ color: 'var(--ink-muted)' }}>
              Log daily feed consumption to track costs and intake per bird.
            </p>
            <Link href="/feed/new" className="btn-primary inline-flex">
              <Plus size={16} /> Log First Feed Record
            </Link>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Flock</th>
                  <th>Feed Type</th>
                  <th>Brand</th>
                  <th>Qty (kg)</th>
                  <th>Cost</th>
                  <th>Feed/Bird</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => {
                  const fpb = r.hens_present && r.hens_present > 0
                    ? ((r.quantity_kg * 1000) / r.hens_present).toFixed(0) + ' g'
                    : '—'
                  return (
                    <tr key={r.id}>
                      <td>{formatDate(r.record_date)}</td>
                      <td style={{ color: 'var(--ink-soft)' }}>
                        {(r.flocks as { flock_code: string })?.flock_code ?? '—'}
                      </td>
                      <td>
                        <span className="badge-gray">{feedLabel(r.feed_type)}</span>
                      </td>
                      <td style={{ color: 'var(--ink-soft)' }}>{r.brand || '—'}</td>
                      <td className="font-semibold">{Number(r.quantity_kg).toFixed(1)}</td>
                      <td className="font-semibold" style={{ color: 'var(--amber)' }}>
                        {r.total_cost ? formatCurrency(r.total_cost) : '—'}
                      </td>
                      <td style={{ color: 'var(--ink-soft)' }}>{fpb}</td>
                      <td>
                        <div className="flex items-center gap-3">
                        <Link
                          href={`/feed/${r.id}/edit`}
                          className="text-xs font-medium flex items-center gap-1"
                          style={{ color: 'var(--green)' }}
                        >
                          <Pencil size={11} /> Edit
                        </Link>
                        <DeleteButton action={deleteFeedRecord.bind(null, r.id)} label="feed record" />
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
