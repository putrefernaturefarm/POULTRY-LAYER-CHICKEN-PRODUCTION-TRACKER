import { requireUser, getCurrentFarm } from '@/lib/session'
import { getExpenses, getExpenseSummary, deleteExpense } from '@/app/actions/expenses'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Receipt, Plus, Pencil } from 'lucide-react'
import Link from 'next/link'
import { EXPENSE_CATEGORIES } from '@/lib/constants'
import DeleteButton from '@/components/shared/DeleteButton'

export const metadata = { title: 'Expenses | LayerPro' }

export default async function ExpensesPage() {
  await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) return <div className="p-6"><p style={{ color: 'var(--ink-soft)' }}>No farm found.</p></div>

  const [expenses, summary] = await Promise.all([
    getExpenses(farm.id),
    getExpenseSummary(farm.id),
  ])

  const catLabel = (val: string) => EXPENSE_CATEGORIES.find(c => c.value === val)?.label ?? val

  const topCats = Object.entries(summary.byCategory)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 4)

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Receipt size={22} style={{ color: 'var(--red)' }} /> Expenses
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--ink-soft)' }}>{farm.name}</p>
        </div>
        <Link href="/expenses/new" className="btn-primary"><Plus size={16} /> Add Expense</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="stat-card" style={{ borderLeft: '4px solid var(--red)' }}>
          <span className="stat-label">Month Total</span>
          <span className="stat-value" style={{ color: 'var(--red)' }}>{formatCurrency(summary.total)}</span>
          <span className="stat-sub">this month</span>
        </div>
        {topCats.slice(0, 2).map(([cat, amt]) => (
          <div key={cat} className="stat-card">
            <span className="stat-label">{catLabel(cat)}</span>
            <span className="stat-value">{formatCurrency(amt as number)}</span>
            <span className="stat-sub">
              {summary.total > 0 ? `${Math.round(((amt as number) / summary.total) * 100)}% of total` : ''}
            </span>
          </div>
        ))}
      </div>

      {/* Category breakdown bar */}
      {topCats.length > 0 && summary.total > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>Spending Breakdown</h3>
            <span className="text-xs" style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>
              this month
            </span>
          </div>
          <div className="px-4 pb-4 space-y-3">
            {topCats.map(([cat, amt]) => {
              const pct = Math.round(((amt as number) / summary.total) * 100)
              return (
                <div key={cat}>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: 'var(--ink-soft)' }}>{catLabel(cat)}</span>
                    <span style={{ color: 'var(--ink)', fontFamily: 'var(--font-mono)' }}>
                      {formatCurrency(amt as number)} <span style={{ color: 'var(--ink-muted)' }}>({pct}%)</span>
                    </span>
                  </div>
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ background: 'var(--paper-2)' }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: 'var(--red)' }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold" style={{ color: 'var(--ink)' }}>Expense Records</h3>
          <span className="badge-gray">{expenses.length} records</span>
        </div>
        {expenses.length === 0 ? (
          <div className="text-center py-12">
            <Receipt size={40} style={{ color: 'var(--line-strong)', margin: '0 auto 12px' }} />
            <p className="font-semibold" style={{ color: 'var(--ink-soft)' }}>No expenses recorded yet</p>
            <Link href="/expenses/new" className="btn-primary mt-4 inline-flex">
              <Plus size={16} /> Add First Expense
            </Link>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Flock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(e => (
                  <tr key={e.id}>
                    <td className="whitespace-nowrap">{formatDate(e.expense_date)}</td>
                    <td><span className="badge-gray">{catLabel(e.category)}</span></td>
                    <td style={{ color: 'var(--ink-soft)' }}>{e.description || '—'}</td>
                    <td className="font-semibold" style={{ color: 'var(--red)' }}>{formatCurrency(e.amount)}</td>
                    <td style={{ color: 'var(--ink-muted)' }}>
                      {(e.flocks as { flock_code: string })?.flock_code ?? '—'}
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/expenses/${e.id}/edit`}
                          className="text-xs font-medium flex items-center gap-1"
                          style={{ color: 'var(--green)' }}
                        >
                          <Pencil size={11} /> Edit
                        </Link>
                        <DeleteButton action={deleteExpense.bind(null, e.id)} label="expense" />
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
