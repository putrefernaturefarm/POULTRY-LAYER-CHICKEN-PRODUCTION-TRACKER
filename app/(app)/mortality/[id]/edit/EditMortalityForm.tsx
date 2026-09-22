'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { updateMortality } from '@/app/actions/mortality'
import { DISPOSAL_METHODS } from '@/lib/constants'

interface Record {
  id: string; record_date: string; flock_id: string; population_at_risk: number
  num_deaths: number; suspected_cause: string | null; diagnostic_info: string | null
  disposal_method: string | null; flock_age_weeks: number | null; notes: string | null
}

export default function EditMortalityForm({ record, flocks }: { record: Record; flocks: { id: string; flock_code: string }[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true); setError('')
    const result = await updateMortality(record.id, new FormData(e.currentTarget))
    if (result?.error) { setError(result.error); toast.error(result.error); setLoading(false) }
    else toast.success('Mortality record updated.')
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
          <label>Flock Age (weeks)</label>
          <input name="flock_age_weeks" type="number" className="input" min={0} defaultValue={record.flock_age_weeks ?? ''} />
        </div>
      </div>

      <div className="form-row">
        <div>
          <label>Population at Risk *</label>
          <input name="population_at_risk" type="number" className="input" required min={0} defaultValue={record.population_at_risk} />
        </div>
        <div>
          <label>Number of Deaths *</label>
          <input name="num_deaths" type="number" className="input" required min={1} defaultValue={record.num_deaths} />
        </div>
      </div>

      <div>
        <label>Suspected Cause *</label>
        <input name="suspected_cause" type="text" className="input" required defaultValue={record.suspected_cause ?? ''} />
      </div>

      <div>
        <label>Diagnostic Info</label>
        <textarea name="diagnostic_info" className="input" rows={2} defaultValue={record.diagnostic_info ?? ''} />
      </div>

      <div>
        <label>Disposal Method</label>
        <select name="disposal_method" className="select" defaultValue={record.disposal_method ?? ''}>
          <option value="">Select...</option>
          {DISPOSAL_METHODS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>
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
