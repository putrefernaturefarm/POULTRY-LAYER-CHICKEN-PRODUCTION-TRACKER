'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { updateVaccinationRecord } from '@/app/actions/vaccination'
import { VACCINATION_ROUTES } from '@/lib/constants'

interface VacRecord {
  id: string; vaccination_date: string; flock_id: string | null; house_id: string | null
  vaccine_name: string; disease_target: string | null; route: string | null
  dose_per_bird: string | null; num_birds_vaccinated: number | null
  manufacturer: string | null; batch_no: string | null; expiry_date: string | null
  administered_by: string | null; next_due_date: string | null; notes: string | null
}

export default function EditVaccinationForm({
  record, flocks, houses,
}: { record: VacRecord; flocks: { id: string; flock_code: string }[]; houses: { id: string; name: string }[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true); setError('')
    const result = await updateVaccinationRecord(record.id, new FormData(e.currentTarget))
    if (result?.error) { setError(result.error); toast.error(result.error); setLoading(false) }
    else toast.success('Vaccination updated.')
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      {error && <div className="alert-danger">{error}</div>}

      <div className="form-row">
        <div>
          <label>Date *</label>
          <input name="vaccination_date" type="date" className="input" required defaultValue={record.vaccination_date} />
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
          <label>Vaccine Name *</label>
          <input name="vaccine_name" type="text" className="input" required defaultValue={record.vaccine_name} />
        </div>
        <div>
          <label>Disease Target</label>
          <input name="disease_target" type="text" className="input" defaultValue={record.disease_target ?? ''} />
        </div>
      </div>

      <div className="form-row">
        <div>
          <label>Route</label>
          <select name="route" className="select" defaultValue={record.route ?? ''}>
            <option value="">Select...</option>
            {VACCINATION_ROUTES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
        <div>
          <label>Dose per Bird</label>
          <input name="dose_per_bird" type="text" className="input" defaultValue={record.dose_per_bird ?? ''} />
        </div>
      </div>

      <div className="form-row">
        <div>
          <label>No. of Birds</label>
          <input name="num_birds_vaccinated" type="number" min="0" className="input" defaultValue={record.num_birds_vaccinated ?? ''} />
        </div>
        <div>
          <label>Administered By</label>
          <input name="administered_by" type="text" className="input" defaultValue={record.administered_by ?? ''} />
        </div>
      </div>

      <div className="form-row">
        <div>
          <label>Manufacturer</label>
          <input name="manufacturer" type="text" className="input" defaultValue={record.manufacturer ?? ''} />
        </div>
        <div>
          <label>Batch No.</label>
          <input name="batch_no" type="text" className="input" defaultValue={record.batch_no ?? ''} />
        </div>
      </div>

      <div className="form-row">
        <div>
          <label>Expiry Date</label>
          <input name="expiry_date" type="date" className="input" defaultValue={record.expiry_date ?? ''} />
        </div>
        <div>
          <label>Next Due Date</label>
          <input name="next_due_date" type="date" className="input" defaultValue={record.next_due_date ?? ''} />
        </div>
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
