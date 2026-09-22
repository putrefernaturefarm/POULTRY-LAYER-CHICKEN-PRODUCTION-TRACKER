'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { updateCullingRecord } from '@/app/actions/culling'
import { CULLING_REASONS, DISPOSAL_METHODS } from '@/lib/constants'

interface CullingRecord {
  id: string; culling_date: string; flock_id: string | null; house_id: string | null
  num_culled: number; reason: string | null; disposal_method: string | null
  revenue: number | null; notes: string | null
}

export default function EditCullingForm({
  record, flocks, houses,
}: { record: CullingRecord; flocks: { id: string; flock_code: string }[]; houses: { id: string; name: string }[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true); setError('')
    const result = await updateCullingRecord(record.id, new FormData(e.currentTarget))
    if (result?.error) { setError(result.error); toast.error(result.error); setLoading(false) }
    else toast.success('Culling record updated.')
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      {error && <div className="alert-danger">{error}</div>}

      <div className="form-row">
        <div>
          <label>Date *</label>
          <input name="culling_date" type="date" className="input" required defaultValue={record.culling_date} />
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
          <label>No. of Birds Culled *</label>
          <input name="num_culled" type="number" min="1" className="input" required defaultValue={record.num_culled} />
        </div>
        <div>
          <label>Reason</label>
          <select name="reason" className="select" defaultValue={record.reason ?? ''}>
            <option value="">Select...</option>
            {CULLING_REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div>
          <label>Disposal Method</label>
          <select name="disposal_method" className="select" defaultValue={record.disposal_method ?? ''}>
            <option value="">Select...</option>
            {DISPOSAL_METHODS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>
        <div>
          <label>Revenue (₱)</label>
          <input name="revenue" type="number" step="0.01" min="0" className="input" defaultValue={record.revenue ?? ''} />
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
