'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { createDebeakingRecord } from '@/app/actions/debeaking'

const METHODS = [
  { value: 'hot_blade', label: 'Hot Blade' },
  { value: 'infrared',  label: 'Infrared (Beak Treatment)' },
  { value: 'precision', label: 'Precision Debeaking' },
  { value: 'manual',    label: 'Manual' },
]

interface Props {
  farmId: string
  flocks: { id: string; flock_code: string; breed_strain?: string | null }[]
  houses: { id: string; name: string }[]
}

export default function NewDebeakingForm({ flocks, houses }: Props) {
  const router  = useRouter()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const today = new Date().toISOString().split('T')[0]

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await createDebeakingRecord(new FormData(e.currentTarget))
    if (result?.error) {
      setError(result.error)
      toast.error(result.error)
      setLoading(false)
    } else {
      toast.success('Debeaking record saved.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="alert-danger">{error}</div>}

      {flocks.length === 0 && (
        <div className="alert-warning">No active flocks found. Add a flock first.</div>
      )}

      <div className="card space-y-4">
        <h3 className="font-semibold text-sm uppercase tracking-wide" style={{ fontFamily: 'var(--font-mono)', color: 'var(--amber)' }}>
          1 — Session Info
        </h3>
        <div className="form-row">
          <div>
            <label>Date *</label>
            <input name="debeaking_date" type="date" className="input" required defaultValue={today} max={today} />
          </div>
          <div>
            <label>Flock *</label>
            <select name="flock_id" className="select" required>
              <option value="">Select flock...</option>
              {flocks.map(f => (
                <option key={f.id} value={f.id}>
                  {f.flock_code}{f.breed_strain ? ` — ${f.breed_strain}` : ''}
                </option>
              ))}
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
      </div>

      <div className="card space-y-4">
        <h3 className="font-semibold text-sm uppercase tracking-wide" style={{ fontFamily: 'var(--font-mono)', color: 'var(--amber)' }}>
          2 — Debeaking Details
        </h3>
        <div className="form-row">
          <div>
            <label>Number of Birds *</label>
            <input name="num_birds" type="number" className="input" min={1} placeholder="e.g. 500" required />
          </div>
          <div>
            <label>Age at Debeaking (weeks)</label>
            <input name="age_weeks" type="number" className="input" min={0} placeholder="e.g. 8" />
          </div>
        </div>
        <div className="form-row">
          <div>
            <label>Method</label>
            <select name="method" className="select">
              <option value="">Select method...</option>
              {METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label>Performed By</label>
            <input name="administered_by" type="text" className="input" placeholder="e.g. Farm technician" />
          </div>
        </div>
        <div>
          <label>Notes</label>
          <textarea name="notes" className="input" rows={2} placeholder="Optional observations..." />
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" className="btn-primary flex-1" disabled={loading || flocks.length === 0}>
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? 'Saving...' : 'Save Debeaking Record'}
        </button>
        <button type="button" className="btn-ghost" onClick={() => router.back()}>Cancel</button>
      </div>
    </form>
  )
}
