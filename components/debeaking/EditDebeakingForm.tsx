'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { updateDebeakingRecord } from '@/app/actions/debeaking'

const METHODS = [
  { value: 'hot_blade', label: 'Hot Blade' },
  { value: 'infrared',  label: 'Infrared (Beak Treatment)' },
  { value: 'precision', label: 'Precision Debeaking' },
  { value: 'manual',    label: 'Manual' },
]

interface Record {
  id: string
  debeaking_date: string
  flock_id?: string | null
  house_id?: string | null
  num_birds: number
  age_weeks?: number | null
  method?: string | null
  administered_by?: string | null
  notes?: string | null
}

interface Props {
  record: Record
  flocks: { id: string; flock_code: string; breed_strain?: string | null }[]
  houses: { id: string; name: string }[]
}

export default function EditDebeakingForm({ record, flocks, houses }: Props) {
  const router  = useRouter()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await updateDebeakingRecord(record.id, new FormData(e.currentTarget))
    if (result?.error) {
      setError(result.error)
      toast.error(result.error)
      setLoading(false)
    } else {
      toast.success('Debeaking record updated.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="alert-danger">{error}</div>}

      <div className="card space-y-4">
        <h3 className="font-semibold text-sm uppercase tracking-wide" style={{ fontFamily: 'var(--font-mono)', color: 'var(--amber)' }}>
          1 — Session Info
        </h3>
        <div className="form-row">
          <div>
            <label>Date *</label>
            <input name="debeaking_date" type="date" className="input" required defaultValue={record.debeaking_date} />
          </div>
          <div>
            <label>Flock *</label>
            <select name="flock_id" className="select" required defaultValue={record.flock_id ?? ''}>
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
            <select name="house_id" className="select" defaultValue={record.house_id ?? ''}>
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
            <input name="num_birds" type="number" className="input" min={1} defaultValue={record.num_birds} required />
          </div>
          <div>
            <label>Age at Debeaking (weeks)</label>
            <input name="age_weeks" type="number" className="input" min={0} defaultValue={record.age_weeks ?? ''} />
          </div>
        </div>
        <div className="form-row">
          <div>
            <label>Method</label>
            <select name="method" className="select" defaultValue={record.method ?? ''}>
              <option value="">Select method...</option>
              {METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label>Performed By</label>
            <input name="administered_by" type="text" className="input" defaultValue={record.administered_by ?? ''} />
          </div>
        </div>
        <div>
          <label>Notes</label>
          <textarea name="notes" className="input" rows={2} defaultValue={record.notes ?? ''} />
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" className="btn-primary flex-1" disabled={loading}>
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? 'Saving...' : 'Update Record'}
        </button>
        <button type="button" className="btn-ghost" onClick={() => router.back()}>Cancel</button>
      </div>
    </form>
  )
}
