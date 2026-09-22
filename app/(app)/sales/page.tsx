import { requireUser, getCurrentFarm } from '@/lib/session'
import { getSales, getSalesSummary, deleteSale } from '@/app/actions/sales'
import { formatDate, formatCurrency } from '@/lib/utils'
import { ShoppingBag, Plus, Pencil } from 'lucide-react'
import Link from 'next/link'
import { SALE_TYPES, EGG_GRADES } from '@/lib/constants'
import DeleteButton from '@/components/shared/DeleteButton'

export const metadata = { title: 'Sales | LayerPro' }

export default async function SalesPage() {
  await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) return <div className="p-6"><p style={{ color: 'var(--ink-soft)' }}>No farm found.</p></div>

  const [sales, summary] = await Promise.all([
    getSales(farm.id),
    getSalesSummary(farm.id),
  ])

  const typeLabel  = (v: string) => SALE_TYPES.find(t => t.value === v)?.label ?? v
  const gradeLabel = (v: string) => EGG_GRADES.find(g => g.value === v)?.label ?? v

  const avgEggPrice = summary.eggQty > 0 ? summary.eggSales / summary.eggQty : 0
  const txCount = sales.length

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <ShoppingBag size={22} style={{ color: 'var(--green)' }} /> Sales
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--ink-soft)' }}>{farm.name}</p>
        </div>
        <Link href="/sales/new" className="btn-primary"><Plus size={16} /> Record Sale</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="stat-card" style={{ borderLeft: '4px solid var(--green)' }}>
          <span className="stat-label">Revenue (Month)</span>
          <span className="stat-value" style={{ color: 'var(--green)' }}>{formatCurrency(summary.total)}</span>
          <span className="stat-sub">all sale types</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Egg Revenue</span>
          <span className="stat-value" style={{ color: 'var(--amber)' }}>{formatCurrency(summary.eggSales)}</span>
          <span className="stat-sub">{Math.round(summary.eggQty).toLocaleString()} eggs</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Avg Price / Egg</span>
          <span className="stat-value">{avgEggPrice > 0 ? `₱${avgEggPrice.toFixed(2)}` : '—'}</span>
          <span className="stat-sub">this month</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Transactions</span>
          <span className="stat-value">{txCount}</span>
          <span className="stat-sub">total records</span>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold" style={{ color: 'var(--ink)' }}>Sales Records</h3>
        </div>
        {sales.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag size={40} style={{ color: 'var(--line-strong)', margin: '0 auto 12px' }} />
            <p className="font-semibold" style={{ color: 'var(--ink-soft)' }}>No sales recorded yet</p>
            <Link href="/sales/new" className="btn-primary mt-4 inline-flex">
              <Plus size={16} /> Record First Sale
            </Link>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Customer</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                  <th>Grade</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sales.map(s => (
                  <tr key={s.id}>
                    <td className="whitespace-nowrap">{formatDate(s.sale_date)}</td>
                    <td><span className="badge-green">{typeLabel(s.sale_type)}</span></td>
                    <td style={{ color: 'var(--ink-soft)' }}>{s.customer_name || '—'}</td>
                    <td>{s.quantity?.toLocaleString()} <span style={{ color: 'var(--ink-muted)', fontSize: '0.75em' }}>{s.unit}</span></td>
                    <td>{formatCurrency(s.unit_price)}</td>
                    <td className="font-semibold" style={{ color: 'var(--green)' }}>{formatCurrency(s.total_amount ?? 0)}</td>
                    <td style={{ color: 'var(--ink-soft)' }}>{s.egg_grade ? gradeLabel(s.egg_grade) : '—'}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/sales/${s.id}/edit`}
                          className="text-xs font-medium flex items-center gap-1"
                          style={{ color: 'var(--green)' }}
                        >
                          <Pencil size={11} /> Edit
                        </Link>
                        <DeleteButton action={deleteSale.bind(null, s.id)} label="sale" />
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
