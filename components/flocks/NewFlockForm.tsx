'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { createFlock } from '@/app/actions/flocks'
import { HOUSING_TYPES } from '@/lib/constants'

export default function NewFlockForm({ houses }: { houses: {id:string;name:string;code:string|null}[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true); setError('')
    const result = await createFlock(new FormData(e.currentTarget))
    if (result?.error) { setError(result.error); toast.error(result.error); setLoading(false) }
    else toast.success('Flock created.')
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-6">
      {error && <div className="alert-danger">{error}</div>}

      <div className="form-row">
        <div>
          <label>Flock Code *</label>
          <input name="flock_code" className="input" required placeholder="e.g., F2024-001" />
        </div>
        <div>
          <label>Batch Number</label>
          <input name="batch_number" className="input" placeholder="e.g., Batch 1" />
        </div>
      </div>

      <div className="form-row">
        <div>
          <label>Breed / Strain</label>
          <input name="breed_strain" className="input" placeholder="e.g., Hy-Line Brown, ISA Brown" />
        </div>
        <div>
          <label>Source</label>
          <input name="source" className="input" placeholder="Hatchery or supplier name" />
        </div>
      </div>

      <div className="form-row">
        <div>
          <label>Date Received *</label>
          <input name="date_received" type="date" className="input" required />
        </div>
        <div>
          <label>Poultry House</label>
          <select name="house_id" className="select">
            <option value="">Select house...</option>
            {houses.map(h => <option key={h.id} value={h.id}>{h.name}{h.code ? ` (${h.code})` : ''}</option>)}
          </select>
        </div>
      </div>

      <div className="form-row-3">
        <div>
          <label>Initial Population *</label>
          <input name="initial_population" type="number" className="input" required min={0} placeholder="Total birds" />
        </div>
        <div>
          <label>Males</label>
          <input name="initial_males" type="number" className="input" defaultValue={0} min={0} />
        </div>
        <div>
          <label>Females</label>
          <input name="initial_females" type="number" className="input" defaultValue={0} min={0} />
        </div>
      </div>

      <div className="form-row">
        <div>
          <label>Production Start Date</label>
          <input name="production_start_date" type="date" className="input" />
        </div>
        <div>
          <label>Expected End Date</label>
          <input name="expected_end_date" type="date" className="input" />
        </div>
      </div>

      <div>
        <label>Notes</label>
        <textarea name="notes" className="input" rows={3} placeholder="Additional flock information..." />
      </div>

      <div className="flex gap-3">
        <button type="submit" className="btn-primary flex-1" disabled={loading}>
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? 'Saving...' : 'Create Flock'}
        </button>
        <button type="button" className="btn-ghost" onClick={() => router.back()}>Cancel</button>
      </div>
    </form>
  )
}
