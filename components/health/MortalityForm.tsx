'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { createMortalityRecord } from '@/app/actions/mortality'
import { DISPOSAL_METHODS } from '@/lib/constants'
import { todayISO, formatPct } from '@/lib/utils'
import { mortalityRate } from '@/lib/calculations'

interface Props {
  flocks: { id: string; flock_code: string }[]
  houses: { id: string; name: string }[]
}

export default function MortalityForm({ flocks, houses }: Props) {
  const router = useRouter()
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [popAtRisk, setPop]     = useState('')
  const [numDeaths, setDeaths]  = useState('')

  const mr = mortalityRate(parseInt(numDeaths)||0, parseInt(popAtRisk)||0)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true); setError('')
    const result = await createMortalityRecord(new FormData(e.currentTarget))
    if (result?.error) { setError(result.error); toast.error(result.error); setLoading(false) }
    else toast.success('Mortality recorded.')
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      {error && <div className="alert-danger">{error}</div>}

      <div className="form-row">
        <div>
          <label>Flock *</label>
          <select name="flock_id" className="select" required>
            <option value="">Select flock...</option>
            {flocks.map(f => <option key={f.id} value={f.id}>{f.flock_code}</option>)}
          </select>
        </div>
        <div>
          <label>Poultry House</label>
          <select name="house_id" className="select">
            <option value="">Select house...</option>
            {houses.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div>
          <label>Date *</label>
          <input name="record_date" type="date" className="input" defaultValue={todayISO()} max={todayISO()} required />
        </div>
        <div>
          <label>Flock Age (weeks)</label>
          <input name="flock_age_weeks" type="number" className="input" placeholder="e.g., 40" min={0} />
        </div>
      </div>

      <div className="form-row">
        <div>
          <label>Population at Risk</label>
          <input name="population_at_risk" type="number" className="input"
            placeholder="Birds in flock" min={0} value={popAtRisk} onChange={e => setPop(e.target.value)} />
        </div>
        <div>
          <label>Number of Deaths *</label>
          <input name="num_deaths" type="number" className="input"
            placeholder="Deaths today" min={1} value={numDeaths}
            onChange={e => setDeaths(e.target.value)} required />
        </div>
      </div>

      {parseInt(popAtRisk) > 0 && parseInt(numDeaths) > 0 && (
        <div className={`rounded-xl p-3 text-sm font-medium ${mr > 5 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
          Mortality Rate: <strong>{formatPct(mr)}</strong>
          {mr > 5 && ' — Elevated mortality. Investigate cause immediately.'}
        </div>
      )}

      <div>
        <label>Suspected Cause</label>
        <input name="suspected_cause" type="text" className="input"
          placeholder="e.g., Disease, Heat stress, Unknown..." />
      </div>

      <div>
        <label>Diagnostic Information</label>
        <textarea name="diagnostic_info" className="input" rows={2}
          placeholder="Necropsy findings, lab results, observations..." />
      </div>

      <div>
        <label>Disposal Method</label>
        <select name="disposal_method" className="select">
          <option value="">Select...</option>
          {DISPOSAL_METHODS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>
      </div>

      <div>
        <label>Notes</label>
        <textarea name="notes" className="input" rows={2} />
      </div>

      <div className="flex gap-3">
        <button type="submit" className="btn-primary flex-1" disabled={loading}>
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? 'Saving...' : 'Save Mortality Record'}
        </button>
        <button type="button" className="btn-ghost" onClick={() => router.back()}>Cancel</button>
      </div>

      <p className="text-xs text-gray-400 text-center">
        This system does not replace veterinary diagnosis. Consult a veterinarian for elevated mortality.
      </p>
    </form>
  )
}
