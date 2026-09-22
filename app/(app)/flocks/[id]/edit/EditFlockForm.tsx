'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { updateFlock } from '@/app/actions/flocks'
import { FLOCK_STATUS, HOUSING_TYPES } from '@/lib/constants'

interface Flock {
  id: string; flock_code: string; batch_number: string | null
  breed_strain: string | null; source: string | null; date_received: string
  house_id: string | null; initial_population: number; initial_males: number | null
  initial_females: number | null; production_start_date: string | null
  expected_end_date: string | null; status: string; notes: string | null
}

interface House { id: string; name: string; code: string | null }

export default function EditFlockForm({ flock, houses }: { flock: Flock; houses: House[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true); setError('')
    const result = await updateFlock(flock.id, new FormData(e.currentTarget))
    if (result?.error) { setError(result.error); toast.error(result.error); setLoading(false) }
    else toast.success('Flock updated.')
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-6">
      {error && <div className="alert-danger">{error}</div>}

      <div className="form-row">
        <div>
          <label>Flock Code *</label>
          <input name="flock_code" className="input" required defaultValue={flock.flock_code} />
        </div>
        <div>
          <label>Batch Number</label>
          <input name="batch_number" className="input" defaultValue={flock.batch_number ?? ''} />
        </div>
      </div>

      <div className="form-row">
        <div>
          <label>Breed / Strain</label>
          <input name="breed_strain" className="input" defaultValue={flock.breed_strain ?? ''} />
        </div>
        <div>
          <label>Source</label>
          <input name="source" className="input" defaultValue={flock.source ?? ''} />
        </div>
      </div>

      <div className="form-row">
        <div>
          <label>Date Received *</label>
          <input name="date_received" type="date" className="input" required defaultValue={flock.date_received} />
        </div>
        <div>
          <label>Poultry House</label>
          <select name="house_id" className="select" defaultValue={flock.house_id ?? ''}>
            <option value="">Select house...</option>
            {houses.map(h => <option key={h.id} value={h.id}>{h.name}{h.code ? ` (${h.code})` : ''}</option>)}
          </select>
        </div>
      </div>

      <div className="form-row-3">
        <div>
          <label>Initial Population *</label>
          <input name="initial_population" type="number" className="input" required min={0} defaultValue={flock.initial_population} />
        </div>
        <div>
          <label>Males</label>
          <input name="initial_males" type="number" className="input" min={0} defaultValue={flock.initial_males ?? 0} />
        </div>
        <div>
          <label>Females</label>
          <input name="initial_females" type="number" className="input" min={0} defaultValue={flock.initial_females ?? 0} />
        </div>
      </div>

      <div className="form-row">
        <div>
          <label>Production Start Date</label>
          <input name="production_start_date" type="date" className="input" defaultValue={flock.production_start_date ?? ''} />
        </div>
        <div>
          <label>Expected End Date</label>
          <input name="expected_end_date" type="date" className="input" defaultValue={flock.expected_end_date ?? ''} />
        </div>
      </div>

      <div>
        <label>Status</label>
        <select name="status" className="select" defaultValue={flock.status}>
          {FLOCK_STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <div>
        <label>Notes</label>
        <textarea name="notes" className="input" rows={3} defaultValue={flock.notes ?? ''} />
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
