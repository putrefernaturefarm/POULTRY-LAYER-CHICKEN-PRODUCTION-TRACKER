'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { createCullingRecord } from '@/app/actions/culling'
import { CULLING_REASONS, DISPOSAL_METHODS } from '@/lib/constants'

interface Flock { id: string; flock_code: string; breed_strain?: string | null }
interface House  { id: string; name: string }

export default function NewCullingForm({ flocks, houses }: { flocks: Flock[]; houses: House[] }) {
  const router  = useRouter()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const today = new Date().toISOString().split('T')[0]

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true); setError('')
    const result = await createCullingRecord(new FormData(e.currentTarget))
    if (result?.error) { setError(result.error); toast.error(result.error); setLoading(false) }
    else toast.success('Culling record saved.')
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      {error && <div className="alert-danger">{error}</div>}

      <div className="form-row">
        <div>
          <label>Date *</label>
          <input name="culling_date" type="date" className="input" required defaultValue={today} />
        </div>
        <div>
          <label>Flock</label>
          <select name="flock_id" className="select">
            <option value="">None</option>
            {flocks.map(f => <option key={f.id} value={f.id}>{f.flock_code}{f.breed_strain ? ` — ${f.breed_strain}` : ''}</option>)}
          </select>
        </div>
      </div>

      {houses.length > 0 && (
        <div>
          <label>House</label>
          <select name="house_id" className="select">
            <option value="">None</option>
            {houses.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
        </div>
      )}

      <div className="form-row">
        <div>
          <label>No. of Birds Culled *</label>
          <input name="num_culled" type="number" min="1" className="input" required placeholder="e.g. 10" />
        </div>
        <div>
          <label>Reason</label>
          <select name="reason" className="select">
            <option value="">Select...</option>
            {CULLING_REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div>
          <label>Disposal Method</label>
          <select name="disposal_method" className="select">
            <option value="">Select...</option>
            {DISPOSAL_METHODS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>
        <div>
          <label>Revenue (₱)</label>
          <input name="revenue" type="number" step="0.01" min="0" className="input" placeholder="e.g. 500 (if sold)" />
        </div>
      </div>

      <div>
        <label>Notes</label>
        <textarea name="notes" className="input" rows={2} />
      </div>

      <div className="flex gap-3">
        <button type="submit" className="btn-primary flex-1" disabled={loading}>
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? 'Saving...' : 'Save Culling Record'}
        </button>
        <button type="button" className="btn-ghost" onClick={() => router.back()}>Cancel</button>
      </div>
    </form>
  )
}
