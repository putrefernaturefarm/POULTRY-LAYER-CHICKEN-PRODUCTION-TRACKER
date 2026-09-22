'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { updateMedicationRecord } from '@/app/actions/medication'
import { MEDICATION_ROUTES } from '@/lib/constants'

interface MedRecord {
  id: string; start_date: string; end_date: string | null; flock_id: string | null; house_id: string | null
  medication_name: string; purpose: string | null; route: string | null; dose_per_bird: string | null
  num_birds_treated: number | null; withdrawal_period_days: number | null
  administered_by: string | null; notes: string | null
}

export default function EditMedicationForm({
  record, flocks, houses,
}: { record: MedRecord; flocks: { id: string; flock_code: string }[]; houses: { id: string; name: string }[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true); setError('')
    const result = await updateMedicationRecord(record.id, new FormData(e.currentTarget))
    if (result?.error) { setError(result.error); toast.error(result.error); setLoading(false) }
    else toast.success('Medication updated.')
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      {error && <div className="alert-danger">{error}</div>}

      <div className="form-row">
        <div>
          <label>Start Date *</label>
          <input name="start_date" type="date" className="input" required defaultValue={record.start_date} />
        </div>
        <div>
          <label>End Date</label>
          <input name="end_date" type="date" className="input" defaultValue={record.end_date ?? ''} />
        </div>
      </div>

      <div className="form-row">
        <div>
          <label>Flock</label>
          <select name="flock_id" className="select" defaultValue={record.flock_id ?? ''}>
            <option value="">None</option>
            {flocks.map(f => <option key={f.id} value={f.id}>{f.flock_code}</option>)}
          </select>
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

      <div className="form-row">
        <div>
          <label>Medication Name *</label>
          <input name="medication_name" type="text" className="input" required defaultValue={record.medication_name} />
        </div>
        <div>
          <label>Purpose</label>
          <input name="purpose" type="text" className="input" defaultValue={record.purpose ?? ''} />
        </div>
      </div>

      <div className="form-row">
        <div>
          <label>Route</label>
          <select name="route" className="select" defaultValue={record.route ?? ''}>
            <option value="">Select...</option>
            {MEDICATION_ROUTES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
        <div>
          <label>Dose per Bird</label>
          <input name="dose_per_bird" type="text" className="input" defaultValue={record.dose_per_bird ?? ''} />
        </div>
      </div>

      <div className="form-row">
        <div>
          <label>No. of Birds Treated</label>
          <input name="num_birds_treated" type="number" min="0" className="input" defaultValue={record.num_birds_treated ?? ''} />
        </div>
        <div>
          <label>Withdrawal Period (days)</label>
          <input name="withdrawal_period_days" type="number" min="0" className="input" defaultValue={record.withdrawal_period_days ?? ''} />
        </div>
      </div>

      <div>
        <label>Administered By</label>
        <input name="administered_by" type="text" className="input" defaultValue={record.administered_by ?? ''} />
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
