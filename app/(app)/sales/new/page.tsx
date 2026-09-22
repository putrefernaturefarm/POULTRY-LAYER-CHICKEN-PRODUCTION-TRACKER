'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { createSale } from '@/app/actions/sales'
import { SALE_TYPES, EGG_GRADES } from '@/lib/constants'
import { todayISO, formatCurrency } from '@/lib/utils'

export default function NewSalePage() {
  const router = useRouter()
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [saleType, setSaleType] = useState('eggs')
  const [qty, setQty]           = useState('')
  const [price, setPrice]       = useState('')

  const total = (parseFloat(qty)||0) * (parseFloat(price)||0)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true); setError('')
    const result = await createSale(new FormData(e.currentTarget))
    if (result?.error) { setError(result.error); toast.error(result.error); setLoading(false) }
    else toast.success('Sale recorded.')
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <h1 className="page-title mb-6">Record Sale</h1>
      <form onSubmit={handleSubmit} className="card space-y-5">
        {error && <div className="alert-danger">{error}</div>}

        <div className="form-row">
          <div>
            <label>Date *</label>
            <input name="sale_date" type="date" className="input" defaultValue={todayISO()} required />
          </div>
          <div>
            <label>Sale Type *</label>
            <select name="sale_type" className="select" required value={saleType}
              onChange={e => setSaleType(e.target.value)}>
              {SALE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>

        {saleType === 'eggs' && (
          <div>
            <label>Egg Grade</label>
            <select name="egg_grade" className="select">
              <option value="">Select grade...</option>
              {EGG_GRADES.filter(g => !['cracked','dirty','rejected'].includes(g.value))
                .map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          </div>
        )}

        <div className="form-row">
          <div>
            <label>Customer Name</label>
            <input name="customer_name" type="text" className="input" placeholder="Optional" />
          </div>
          <div>
            <label>Customer Contact</label>
            <input name="customer_contact" type="text" className="input" placeholder="Phone / address" />
          </div>
        </div>

        <div className="form-row-3">
          <div>
            <label>Quantity *</label>
            <input name="quantity" type="number" className="input" required min={0} step="0.01"
              value={qty} onChange={e => setQty(e.target.value)} />
          </div>
          <div>
            <label>Unit</label>
            <input name="unit" type="text" className="input"
              defaultValue={saleType === 'eggs' ? 'pieces' : 'birds'} />
          </div>
          <div>
            <label>Unit Price (₱) *</label>
            <input name="unit_price" type="number" className="input" required min={0} step="0.01"
              value={price} onChange={e => setPrice(e.target.value)} />
          </div>
        </div>

        {total > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm font-semibold text-green-700">
            Total Amount: {formatCurrency(total)}
          </div>
        )}

        <div>
          <label>Notes</label>
          <textarea name="notes" className="input" rows={2} />
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn-primary flex-1" disabled={loading}>
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Saving...' : 'Save Sale'}
          </button>
          <button type="button" className="btn-ghost" onClick={() => router.back()}>Cancel</button>
        </div>
      </form>
    </div>
  )
}
