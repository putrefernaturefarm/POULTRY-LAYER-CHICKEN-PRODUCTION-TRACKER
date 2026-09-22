'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { updateExpense } from '@/app/actions/expenses'
import { EXPENSE_CATEGORIES } from '@/lib/constants'

interface Expense {
  id: string; expense_date: string; category: string; description: string | null
  amount: number; supplier: string | null; receipt_no: string | null
  notes: string | null; flock_id: string | null
}

export default function EditExpenseForm({ expense, flocks }: { expense: Expense; flocks: { id: string; flock_code: string }[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true); setError('')
    const result = await updateExpense(expense.id, new FormData(e.currentTarget))
    if (result?.error) { setError(result.error); toast.error(result.error); setLoading(false) }
    else toast.success('Expense updated.')
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      {error && <div className="alert-danger">{error}</div>}

      <div className="form-row">
        <div>
          <label>Date *</label>
          <input name="expense_date" type="date" className="input" required defaultValue={expense.expense_date} />
        </div>
        <div>
          <label>Category *</label>
          <select name="category" className="select" defaultValue={expense.category} required>
            <option value="">Select...</option>
            {EXPENSE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label>Description</label>
        <input name="description" type="text" className="input" defaultValue={expense.description ?? ''} />
      </div>

      <div className="form-row">
        <div>
          <label>Amount (₱) *</label>
          <input name="amount" type="number" step="0.01" className="input" required min={0} defaultValue={expense.amount} />
        </div>
        <div>
          <label>Flock</label>
          <select name="flock_id" className="select" defaultValue={expense.flock_id ?? ''}>
            <option value="">None</option>
            {flocks.map(f => <option key={f.id} value={f.id}>{f.flock_code}</option>)}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div>
          <label>Supplier</label>
          <input name="supplier" type="text" className="input" defaultValue={expense.supplier ?? ''} />
        </div>
        <div>
          <label>Receipt No.</label>
          <input name="receipt_no" type="text" className="input" defaultValue={expense.receipt_no ?? ''} />
        </div>
      </div>

      <div>
        <label>Notes</label>
        <textarea name="notes" className="input" rows={2} defaultValue={expense.notes ?? ''} />
      </div>

      <div className="flex gap-3">
        <button type="submit" className="btn-primary flex-1" disabled={loading}>
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
        <button type="button" className="btn-ghost" onClick={() => router.back()}>Cancel</button>
      </div>
    </form>
  )
}
