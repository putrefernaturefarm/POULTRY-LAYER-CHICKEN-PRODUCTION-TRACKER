'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { createWaterRecord } from '@/app/actions/water'

interface Flock { id: string; flock_code: string; breed_strain?: string | null; initial_population?: number | null }
interface House  { id: string; name: string }

export default function NewWaterForm({ flocks, houses }: { flocks: Flock[]; houses: House[] }) {
  const router  = useRouter()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [morning,   setMorning]   = useState('')
  const [afternoon, setAfternoon] = useState('')

  const today = new Date().toISOString().split('T')[0]
  const total = (parseFloat(morning) || 0) + (parseFloat(afternoon) || 0)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true); setError('')
    const fd = new FormData(e.currentTarget)
    if (total > 0) fd.set('total_liters', String(total))
    const result = await createWaterRecord(fd)
    if (result?.error) { setError(result.error); toast.error(result.error); setLoading(false) }
    else toast.success('Water record saved.')
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      {error && <div className="alert-danger">{error}</div>}

      <div className="form-row">
        <div>
          <label>Date *</label>
          <input name="record_date" type="date" className="input" required defaultValue={today} />
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
          <label>Morning (L)</label>
          <input name="morning_liters" type="number" step="0.1" min="0" className="input"
            placeholder="e.g. 120" value={morning} onChange={e => setMorning(e.target.value)} />
        </div>
        <div>
          <label>Afternoon (L)</label>
          <input name="afternoon_liters" type="number" step="0.1" min="0" className="input"
            placeholder="e.g. 80" value={afternoon} onChange={e => setAfternoon(e.target.value)} />
        </div>
      </div>

      <div className="form-row">
        <div>
          <label>Total Liters{total > 0 ? ' — auto-calculated' : ' *'}</label>
          <input name="total_liters" type="number" step="0.1" min="0" className="input"
            value={total > 0 ? total.toFixed(1) : ''} readOnly={total > 0} required={total === 0}
            style={total > 0 ? { background: 'var(--paper-2)', color: 'var(--ink-soft)' } : {}}
            onChange={() => {}} placeholder="e.g. 200" />
        </div>
        <div>
          <label>Hens Present</label>
          <input name="hens_present" type="number" min="0" className="input" placeholder="e.g. 500" />
        </div>
      </div>

      <div>
        <label>Water Source</label>
        <input name="water_source" type="text" className="input" placeholder="e.g. Deep well, Municipal" />
      </div>

      {total > 0 && (
        <div className="rounded-lg p-3 text-center" style={{ background: 'var(--paper-2)', border: '1px solid var(--line)' }}>
          <span className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: '#3b9fe8' }}>
            {total.toFixed(1)} L
          </span>
          <p className="text-xs mt-0.5" style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>total today</p>
        </div>
      )}

      <div>
        <label>Notes</label>
        <textarea name="notes" className="input" rows={2} placeholder="Optional notes..." />
      </div>

      <div className="flex gap-3">
        <button type="submit" className="btn-primary flex-1" disabled={loading}>
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? 'Saving...' : 'Save Record'}
        </button>
        <button type="button" className="btn-ghost" onClick={() => router.back()}>Cancel</button>
      </div>
    </form>
  )
}
