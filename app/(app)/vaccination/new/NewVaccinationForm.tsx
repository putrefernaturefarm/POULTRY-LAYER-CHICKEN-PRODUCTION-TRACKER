'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { createVaccinationRecord } from '@/app/actions/vaccination'
import { VACCINATION_ROUTES } from '@/lib/constants'

interface Flock { id: string; flock_code: string; breed_strain?: string | null }
interface House  { id: string; name: string }

export default function NewVaccinationForm({ flocks, houses }: { flocks: Flock[]; houses: House[] }) {
  const router  = useRouter()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const today = new Date().toISOString().split('T')[0]

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true); setError('')
    const result = await createVaccinationRecord(new FormData(e.currentTarget))
    if (result?.error) { setError(result.error); toast.error(result.error); setLoading(false) }
    else toast.success('Vaccination record saved.')
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      {error && <div className="alert-danger">{error}</div>}

      <div className="form-row">
        <div>
          <label>Date *</label>
          <input name="vaccination_date" type="date" className="input" required defaultValue={today} />
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
          <label>Vaccine Name *</label>
          <input name="vaccine_name" type="text" className="input" required placeholder="e.g. Newcastle Disease" />
        </div>
        <div>
          <label>Disease Target</label>
          <input name="disease_target" type="text" className="input" placeholder="e.g. ND, IB, Marek's" />
        </div>
      </div>

      <div className="form-row">
        <div>
          <label>Route</label>
          <select name="route" className="select">
            <option value="">Select...</option>
            {VACCINATION_ROUTES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
        <div>
          <label>Dose per Bird</label>
          <input name="dose_per_bird" type="text" className="input" placeholder="e.g. 1 drop, 0.5 mL" />
        </div>
      </div>

      <div className="form-row">
        <div>
          <label>No. of Birds Vaccinated</label>
          <input name="num_birds_vaccinated" type="number" min="0" className="input" />
        </div>
        <div>
          <label>Administered By</label>
          <input name="administered_by" type="text" className="input" placeholder="Name / Vet" />
        </div>
      </div>

      <div className="form-row">
        <div>
          <label>Manufacturer</label>
          <input name="manufacturer" type="text" className="input" placeholder="e.g. Intervet" />
        </div>
        <div>
          <label>Batch No.</label>
          <input name="batch_no" type="text" className="input" />
        </div>
      </div>

      <div className="form-row">
        <div>
          <label>Expiry Date</label>
          <input name="expiry_date" type="date" className="input" />
        </div>
        <div>
          <label>Next Due Date</label>
          <input name="next_due_date" type="date" className="input" />
        </div>
      </div>

      <div>
        <label>Notes</label>
        <textarea name="notes" className="input" rows={2} />
      </div>

      <div className="flex gap-3">
        <button type="submit" className="btn-primary flex-1" disabled={loading}>
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? 'Saving...' : 'Save Vaccination'}
        </button>
        <button type="button" className="btn-ghost" onClick={() => router.back()}>Cancel</button>
      </div>
    </form>
  )
}
