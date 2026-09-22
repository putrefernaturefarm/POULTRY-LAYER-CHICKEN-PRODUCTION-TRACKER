'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { updateWaterRecord } from '@/app/actions/water'

interface WaterRecord {
  id: string; record_date: string; flock_id: string | null; house_id: string | null
  morning_liters: number | null; afternoon_liters: number | null; total_liters: number
  hens_present: number | null; water_source: string | null; notes: string | null
}

export default function EditWaterForm({
  record, flocks, houses,
}: { record: WaterRecord; flocks: { id: string; flock_code: string }[]; houses: { id: string; name: string }[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [morning,   setMorning]   = useState(record.morning_liters   != null ? String(record.morning_liters)   : '')
  const [afternoon, setAfternoon] = useState(record.afternoon_liters != null ? String(record.afternoon_liters) : '')

  const calcTotal = (parseFloat(morning) || 0) + (parseFloat(afternoon) || 0)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true); setError('')
    const fd = new FormData(e.currentTarget)
    if (calcTotal > 0) fd.set('total_liters', String(calcTotal))
    const result = await updateWaterRecord(record.id, fd)
    if (result?.error) { setError(result.error); toast.error(result.error); setLoading(false) }
    else toast.success('Water record updated.')
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
          <label>Morning (L)</label>
          <input name="morning_liters" type="number" step="0.1" min="0" className="input"
            value={morning} onChange={e => setMorning(e.target.value)} />
        </div>
        <div>
          <label>Afternoon (L)</label>
          <input name="afternoon_liters" type="number" step="0.1" min="0" className="input"
            value={afternoon} onChange={e => setAfternoon(e.target.value)} />
        </div>
      </div>

      <div className="form-row">
        <div>
          <label>Total Liters *</label>
          <input name="total_liters" type="number" step="0.1" min="0" className="input" required
            value={calcTotal > 0 ? calcTotal.toFixed(1) : record.total_liters}
            readOnly={calcTotal > 0} onChange={() => {}}
            style={calcTotal > 0 ? { background: 'var(--paper-2)', color: 'var(--ink-soft)' } : {}} />
        </div>
        <div>
          <label>Hens Present</label>
          <input name="hens_present" type="number" min="0" className="input" defaultValue={record.hens_present ?? ''} />
        </div>
      </div>

      <div>
        <label>Water Source</label>
        <input name="water_source" type="text" className="input" defaultValue={record.water_source ?? ''} />
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
