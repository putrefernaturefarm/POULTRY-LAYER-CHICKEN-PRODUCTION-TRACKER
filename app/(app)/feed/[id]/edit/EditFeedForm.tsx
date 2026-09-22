'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { updateFeedRecord } from '@/app/actions/feed'
import { FEED_TYPES } from '@/lib/constants'

interface FeedRecord {
  id: string
  record_date: string
  flock_id: string | null
  house_id: string | null
  feed_type: string
  brand: string | null
  quantity_kg: number
  num_bags: number | null
  bag_size_kg: number | null
  cost_per_bag: number | null
  total_cost: number | null
  hens_present: number | null
  notes: string | null
}

interface Props {
  record: FeedRecord
  flocks: { id: string; flock_code: string }[]
  houses: { id: string; name: string }[]
}

export default function EditFeedForm({ record, flocks, houses }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const [numBags,    setNumBags]    = useState(record.num_bags    != null ? String(record.num_bags)    : '')
  const [bagSize,    setBagSize]    = useState(record.bag_size_kg != null ? String(record.bag_size_kg) : '')
  const [costPerBag, setCostPerBag] = useState(record.cost_per_bag != null ? String(record.cost_per_bag) : '')

  const calcKg = (() => {
    const bags = parseFloat(numBags)
    const kg   = parseFloat(bagSize)
    if (!isNaN(bags) && !isNaN(kg) && bags > 0 && kg > 0) return bags * kg
    return null
  })()

  const calcCost = (() => {
    const bags = parseFloat(numBags)
    const cpb  = parseFloat(costPerBag)
    if (!isNaN(bags) && !isNaN(cpb) && bags > 0 && cpb > 0) return bags * cpb
    return null
  })()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const fd = new FormData(e.currentTarget)
    if (calcKg != null)   fd.set('quantity_kg', String(calcKg))
    if (calcCost != null) fd.set('total_cost',  String(calcCost))

    const result = await updateFeedRecord(record.id, fd)
    if (result?.error) {
      setError(result.error)
      toast.error(result.error)
      setLoading(false)
    } else {
      toast.success('Feed record updated.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      {error && <div className="alert-danger">{error}</div>}

      <div className="form-row">
        <div>
          <label>Date *</label>
          <input name="record_date" type="date" className="input" required defaultValue={record.record_date} />
        </div>
        <div>
          <label>Flock</label>
          <select name="flock_id" className="select" defaultValue={record.flock_id ?? ''}>
            <option value="">None</option>
            {flocks.map(f => <option key={f.id} value={f.id}>{f.flock_code}</option>)}
          </select>
        </div>
      </div>

      {houses.length > 0 && (
        <div>
          <label>House</label>
          <select name="house_id" className="select" defaultValue={record.house_id ?? ''}>
            <option value="">None</option>
            {houses.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
        </div>
      )}

      <div className="form-row">
        <div>
          <label>Feed Type *</label>
          <select name="feed_type" className="select" defaultValue={record.feed_type} required>
            <option value="">Select...</option>
            {FEED_TYPES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </div>
        <div>
          <label>Brand</label>
          <input name="brand" type="text" className="input" defaultValue={record.brand ?? ''} />
        </div>
      </div>

      <div className="form-row">
        <div>
          <label>No. of Bags</label>
          <input
            name="num_bags" type="number" step="0.5" min="0" className="input"
            value={numBags} onChange={e => setNumBags(e.target.value)}
          />
        </div>
        <div>
          <label>Bag Size (kg)</label>
          <input
            name="bag_size_kg" type="number" step="0.5" min="0" className="input"
            value={bagSize} onChange={e => setBagSize(e.target.value)}
          />
        </div>
      </div>

      <div className="form-row">
        <div>
          <label>Total Quantity (kg) *</label>
          <input
            name="quantity_kg" type="number" step="0.001" min="0" className="input" required
            value={calcKg != null ? calcKg.toFixed(3) : record.quantity_kg}
            readOnly={calcKg != null}
            onChange={() => {}}
            style={calcKg != null ? { background: 'var(--paper-2)', color: 'var(--ink-soft)' } : {}}
          />
        </div>
        <div>
          <label>Cost per Bag (₱)</label>
          <input
            name="cost_per_bag" type="number" step="0.01" min="0" className="input"
            value={costPerBag} onChange={e => setCostPerBag(e.target.value)}
          />
        </div>
      </div>

      <div className="form-row">
        <div>
          <label>Total Cost (₱)</label>
          <input
            name="total_cost" type="number" step="0.01" min="0" className="input"
            value={calcCost != null ? calcCost.toFixed(2) : (record.total_cost ?? '')}
            readOnly={calcCost != null}
            onChange={() => {}}
            style={calcCost != null ? { background: 'var(--paper-2)', color: 'var(--ink-soft)' } : {}}
          />
        </div>
        <div>
          <label>Hens Present</label>
          <input name="hens_present" type="number" min="0" className="input" defaultValue={record.hens_present ?? ''} />
        </div>
      </div>

      <div>
        <label>Notes</label>
        <textarea name="notes" className="input" rows={2} defaultValue={record.notes ?? ''} />
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
