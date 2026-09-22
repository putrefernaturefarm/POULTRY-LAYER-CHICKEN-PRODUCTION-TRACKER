import { requireUser, getCurrentFarm } from '@/lib/session'
import { getSales, getSalesSummary } from '@/app/actions/sales'
import { formatDate, formatCurrency, cn } from '@/lib/utils'
import { ShoppingBag, Plus, Pencil } from 'lucide-react'
import Link from 'next/link'
import { SALE_TYPES, EGG_GRADES } from '@/lib/constants'

export default async function SalesPage() {
  await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) return <div className="p-6"><p className="text-gray-500">No farm found.</p></div>

  const [sales, summary] = await Promise.all([
    getSales(farm.id),
    getSalesSummary(farm.id),
  ])

  const typeLabel = (v: string) => SALE_TYPES.find(t => t.value === v)?.label ?? v
  const gradeLabel = (v: string) => EGG_GRADES.find(g => g.value === v)?.label ?? v

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title flex items-center gap-2"><ShoppingBag size={24} className="text-green-600" /> Sales</h1>
        <Link href="/sales/new" className="btn-primary"><Plus size={16} /> Record Sale</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="stat-card border-l-4 border-green-500">
          <span className="stat-label">Total Revenue (Month)</span>
          <span className="stat-value text-green-600">{formatCurrency(summary.total)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Egg Sales</span>
          <span className="stat-value text-amber-600">{formatCurrency(summary.eggSales)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Bird Sales</span>
          <span className="stat-value">{formatCurrency(summary.birdSales)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Eggs Sold</span>
          <span className="stat-value">{Math.round(summary.eggQty).toLocaleString()}</span>
          <span className="stat-sub">this month</span>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold text-gray-900">Sales Records</h3>
        </div>
        {sales.length === 0 ? (
          <div className="text-center py-10">
            <ShoppingBag size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">No sales recorded yet</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Date</th><th>Type</th><th>Customer</th><th>Qty</th><th>Unit Price</th><th>Total</th><th>Grade</th><th>Actions</th></tr></thead>
              <tbody>
                {sales.map(s => (
                  <tr key={s.id}>
                    <td>{formatDate(s.sale_date)}</td>
                    <td><span className="badge-green">{typeLabel(s.sale_type)}</span></td>
                    <td>{s.customer_name || '—'}</td>
                    <td>{s.quantity?.toLocaleString()} {s.unit}</td>
                    <td>{formatCurrency(s.unit_price)}</td>
                    <td className="font-semibold text-green-700">{formatCurrency(s.total_amount ?? 0)}</td>
                    <td>{s.egg_grade ? gradeLabel(s.egg_grade) : '—'}</td>
                    <td>
                      <Link href={`/sales/${s.id}/edit`} className="text-blue-600 hover:underline text-xs font-medium flex items-center gap-1">
                        <Pencil size={11} /> Edit
                      </Link>
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
