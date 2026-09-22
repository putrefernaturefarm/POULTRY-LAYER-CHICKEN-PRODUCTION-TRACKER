import { requireUser, getCurrentFarm } from '@/lib/session'
import { getExpenses } from '@/app/actions/expenses'
import { getSales } from '@/app/actions/sales'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import { EXPENSE_CATEGORIES } from '@/lib/constants'
import DownloadCSVButton from '@/components/reports/DownloadCSVButton'

export default async function FinancialReportPage() {
  await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) return <div className="p-6"><p className="text-gray-500">No farm found.</p></div>

  const [expenses, sales] = await Promise.all([
    getExpenses(farm.id, 200),
    getSales(farm.id, 200),
  ])

  // Current month filter
  const thisMonth = new Date().toISOString().slice(0, 7)
  const monthExp  = expenses.filter(e => e.expense_date?.startsWith(thisMonth))
  const monthSal  = sales.filter(s => s.sale_date?.startsWith(thisMonth))

  const totalRev  = monthSal.reduce((s, r) => s + (r.total_amount || 0), 0)
  const totalExp  = monthExp.reduce((s, r) => s + (r.amount || 0), 0)
  const gm        = totalRev - totalExp
  const gmPct     = totalRev > 0 ? (gm / totalRev) * 100 : 0

  const byCategory = monthExp.reduce((acc: Record<string, number>, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount
    return acc
  }, {})
  const catLabel = (v: string) => EXPENSE_CATEGORIES.find(c => c.value === v)?.label ?? v

  const salesCSV = monthSal.map(s => ({
    Date:     formatDate(s.sale_date),
    Type:     s.sale_type,
    Customer: s.customer_name ?? '',
    Quantity: s.quantity ?? 0,
    Unit:     s.unit ?? '',
    Amount:   s.total_amount ?? 0,
  }))

  const expenseCSV = monthExp.map(e => ({
    Date:     formatDate(e.expense_date),
    Category: catLabel(e.category),
    Description: e.description ?? '',
    Amount:   e.amount,
    Vendor:   e.vendor ?? '',
  }))

  const combinedCSV = [
    ...salesCSV.map(r => ({ Record: 'Sale', ...r })),
    ...expenseCSV.map(r => ({ Record: 'Expense', Date: r.Date, Type: r.Category, Customer: r.Description, Quantity: '', Unit: r.Vendor, Amount: r.Amount })),
  ]

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <DollarSign size={24} className="text-green-600" /> Financial Report
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{new Date().toLocaleString('en-PH', {month:'long',year:'numeric'})} — {farm.name}</p>
        </div>
        <DownloadCSVButton data={combinedCSV} filename="financial-report" />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="stat-card border-l-4 border-green-500">
          <span className="stat-label">Total Revenue</span>
          <span className="stat-value text-green-600">{formatCurrency(totalRev)}</span>
        </div>
        <div className="stat-card border-l-4 border-red-400">
          <span className="stat-label">Total Expenses</span>
          <span className="stat-value text-red-600">{formatCurrency(totalExp)}</span>
        </div>
        <div className={cn('stat-card border-l-4', gm >= 0 ? 'border-green-500' : 'border-red-500')}>
          <span className="stat-label">Gross Margin</span>
          <span className={cn('stat-value', gm >= 0 ? 'text-green-600' : 'text-red-600')}>
            {formatCurrency(gm)}
          </span>
          <span className="stat-sub">{gm >= 0 ? <TrendingUp size={12} className="inline text-green-500" /> : <TrendingDown size={12} className="inline text-red-500" />} {gmPct.toFixed(1)}%</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Transactions</span>
          <span className="stat-value">{monthSal.length + monthExp.length}</span>
        </div>
      </div>

      {/* Expense breakdown */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Expense Breakdown</h3>
        <div className="space-y-2">
          {Object.entries(byCategory).sort((a,b)=>b[1]-a[1]).map(([cat, amt]) => (
            <div key={cat} className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-40 shrink-0">{catLabel(cat)}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div className="bg-red-400 h-2 rounded-full" style={{ width: `${Math.min(100, (amt/totalExp*100)).toFixed(0)}%` }} />
              </div>
              <span className="text-sm font-semibold text-red-700 w-28 text-right">{formatCurrency(amt as number)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sales table */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Sales This Month</h3>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Date</th><th>Type</th><th>Customer</th><th>Qty</th><th>Amount</th></tr></thead>
            <tbody>
              {monthSal.map(s => (
                <tr key={s.id}>
                  <td>{formatDate(s.sale_date)}</td>
                  <td>{s.sale_type}</td>
                  <td>{s.customer_name || '—'}</td>
                  <td>{s.quantity?.toLocaleString()} {s.unit}</td>
                  <td className="font-semibold text-green-700">{formatCurrency(s.total_amount ?? 0)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-gray-300">
                <td colSpan={4} className="font-bold text-right pr-4">Total Revenue</td>
                <td className="font-bold text-green-700">{formatCurrency(totalRev)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
