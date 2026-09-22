'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { createExpense } from '@/app/actions/expenses'
import { EXPENSE_CATEGORIES } from '@/lib/constants'
import { todayISO } from '@/lib/utils'

export default function NewExpensePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true); setError('')
    const result = await createExpense(new FormData(e.currentTarget))
    if (result?.error) { setError(result.error); toast.error(result.error); setLoading(false) }
    else toast.success('Expense recorded.')
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <h1 className="page-title mb-6">Add Expense</h1>
      <form onSubmit={handleSubmit} className="card space-y-5">
        {error && <div className="alert-danger">{error}</div>}

        <div className="form-row">
          <div>
            <label>Date *</label>
            <input name="expense_date" type="date" className="input" defaultValue={todayISO()} required />
          </div>
          <div>
            <label>Category *</label>
            <select name="category" className="select" required>
              <option value="">Select category...</option>
              {EXPENSE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label>Description</label>
          <input name="description" type="text" className="input" placeholder="What is this expense for?" />
        </div>

        <div className="form-row">
          <div>
            <label>Amount (₱) *</label>
            <input name="amount" type="number" className="input" required min={0} step="0.01" placeholder="0.00" />
          </div>
          <div>
            <label>Supplier / Payee</label>
            <input name="supplier" type="text" className="input" placeholder="Where was this paid?" />
          </div>
        </div>

        <div>
          <label>Receipt / Reference No.</label>
          <input name="receipt_no" type="text" className="input" placeholder="Optional receipt number" />
        </div>

        <div>
          <label>Notes</label>
          <textarea name="notes" className="input" rows={2} />
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn-primary flex-1" disabled={loading}>
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Saving...' : 'Save Expense'}
          </button>
          <button type="button" className="btn-ghost" onClick={() => router.back()}>Cancel</button>
        </div>
      </form>
    </div>
  )
}
