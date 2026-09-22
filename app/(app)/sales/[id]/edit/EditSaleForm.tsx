'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { updateSale } from '@/app/actions/sales'
import { SALE_TYPES, EGG_GRADES } from '@/lib/constants'

interface Sale {
  id: string; sale_date: string; sale_type: string; customer_name: string | null
  customer_contact: string | null; quantity: number; unit: string; unit_price: number
  egg_grade: string | null; description: string | null; receipt_no: string | null
  notes: string | null; flock_id: string | null
}

export default function EditSaleForm({ sale, flocks }: { sale: Sale; flocks: { id: string; flock_code: string }[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true); setError('')
    const result = await updateSale(sale.id, new FormData(e.currentTarget))
    if (result?.error) { setError(result.error); toast.error(result.error); setLoading(false) }
    else toast.success('Sale updated.')
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      {error && <div className="alert-danger">{error}</div>}

      <div className="form-row">
        <div>
          <label>Sale Date *</label>
          <input name="sale_date" type="date" className="input" required defaultValue={sale.sale_date} />
        </div>
        <div>
          <label>Sale Type *</label>
          <select name="sale_type" className="select" defaultValue={sale.sale_type} required>
            {SALE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div>
          <label>Customer Name</label>
          <input name="customer_name" type="text" className="input" defaultValue={sale.customer_name ?? ''} />
        </div>
        <div>
          <label>Customer Contact</label>
          <input name="customer_contact" type="text" className="input" defaultValue={sale.customer_contact ?? ''} />
        </div>
      </div>

      <div className="form-row-3">
        <div>
          <label>Quantity *</label>
          <input name="quantity" type="number" step="0.01" className="input" required min={0} defaultValue={sale.quantity} />
        </div>
        <div>
          <label>Unit</label>
          <input name="unit" type="text" className="input" defaultValue={sale.unit} placeholder="pcs / trays / kg" />
        </div>
        <div>
          <label>Unit Price (₱) *</label>
          <input name="unit_price" type="number" step="0.01" className="input" required min={0} defaultValue={sale.unit_price} />
        </div>
      </div>

      <div className="form-row">
        <div>
          <label>Egg Grade</label>
          <select name="egg_grade" className="select" defaultValue={sale.egg_grade ?? ''}>
            <option value="">N/A</option>
            {EGG_GRADES.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
        </div>
        <div>
          <label>Flock</label>
          <select name="flock_id" className="select" defaultValue={sale.flock_id ?? ''}>
            <option value="">None</option>
            {flocks.map(f => <option key={f.id} value={f.id}>{f.flock_code}</option>)}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div>
          <label>Description</label>
          <input name="description" type="text" className="input" defaultValue={sale.description ?? ''} />
        </div>
        <div>
          <label>Receipt No.</label>
          <input name="receipt_no" type="text" className="input" defaultValue={sale.receipt_no ?? ''} />
        </div>
      </div>

      <div>
        <label>Notes</label>
        <textarea name="notes" className="input" rows={2} defaultValue={sale.notes ?? ''} />
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
