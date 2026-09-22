import { requireUser, getCurrentFarm } from '@/lib/session'
import { getExpenses, getExpenseSummary } from '@/app/actions/expenses'
import { formatDate, formatCurrency, cn } from '@/lib/utils'
import { Receipt, Plus } from 'lucide-react'
import Link from 'next/link'
import { EXPENSE_CATEGORIES } from '@/lib/constants'

export default async function ExpensesPage() {
  await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) return <div className="p-6"><p className="text-gray-500">No farm found.</p></div>

  const [expenses, summary] = await Promise.all([
    getExpenses(farm.id),
    getExpenseSummary(farm.id),
  ])

  const catLabel = (val: string) => EXPENSE_CATEGORIES.find(c => c.value === val)?.label ?? val

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title flex items-center gap-2"><Receipt size={24} className="text-red-500" /> Expenses</h1>
        <Link href="/expenses/new" className="btn-primary"><Plus size={16} /> Add Expense</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="stat-card border-l-4 border-red-400">
          <span className="stat-label">Month Total</span>
          <span className="stat-value text-red-600">{formatCurrency(summary.total)}</span>
        </div>
        {Object.entries(summary.byCategory).sort((a,b)=>b[1]-a[1]).slice(0,4).map(([cat, amt]) => (
          <div key={cat} className="stat-card">
            <span className="stat-label">{catLabel(cat)}</span>
            <span className="stat-value text-gray-700 text-lg">{formatCurrency(amt as number)}</span>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold text-gray-900">Expense Records</h3>
        </div>
        {expenses.length === 0 ? (
          <div className="text-center py-10">
            <Receipt size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">No expenses recorded yet</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th><th>Flock</th></tr></thead>
              <tbody>
                {expenses.map(e => (
                  <tr key={e.id}>
                    <td>{formatDate(e.expense_date)}</td>
                    <td><span className="badge-gray">{catLabel(e.category)}</span></td>
                    <td>{e.description || '—'}</td>
                    <td className="font-semibold text-red-700">{formatCurrency(e.amount)}</td>
                    <td className="text-gray-400">{(e.flocks as {flock_code:string})?.flock_code ?? '—'}</td>
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
