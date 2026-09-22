'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, AlertTriangle } from 'lucide-react'
import { createMorbidityRecord } from '@/app/actions/morbidity'
import { HEALTH_OUTCOMES } from '@/lib/constants'
import { todayISO, morbidityRate, formatPct } from '@/lib/utils'

interface Props {
  flocks: { id: string; flock_code: string; breed_strain: string | null }[]
  houses: { id: string; name: string; code: string | null }[]
}

export default function MorbidityForm({ flocks, houses }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const [popAtRisk,   setPopAtRisk]   = useState('')
  const [numAffected, setNumAffected] = useState('')

  const calcRate = morbidityRate(
    parseInt(numAffected) || 0,
    parseInt(popAtRisk)   || 0
  )

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true); setError('')
    const fd = new FormData(e.currentTarget)
    const result = await createMorbidityRecord(fd)
    if (result?.error) {
      setError(result.error)
      toast.error(result.error)
      setLoading(false)
    } else {
      toast.success('Morbidity event recorded.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-6">
      {error && <div className="alert-danger">{error}</div>}

      <div className="alert-warning flex items-start gap-2 text-sm">
        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
        <span>
          <strong>Important:</strong> Morbidity means birds are <em>sick or affected</em>, not dead.
          Use the Mortality module for deaths.
        </span>
      </div>

      {/* Basic info */}
      <div className="form-section">
        <p className="section-title">Event Details</p>
        <div className="form-row">
          <div>
            <label>Flock *</label>
            <select name="flock_id" className="select" required>
              <option value="">Select flock...</option>
              {flocks.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.flock_code}{f.breed_strain ? ` — ${f.breed_strain}` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Poultry House</label>
            <select name="house_id" className="select">
              <option value="">Select house...</option>
              {houses.map((h) => (
                <option key={h.id} value={h.id}>{h.name}{h.code ? ` (${h.code})` : ''}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div>
            <label>Date of Observation *</label>
            <input name="record_date" type="date" className="input"
              defaultValue={todayISO()} max={todayISO()} required />
          </div>
          <div>
            <label>Flock Age (weeks)</label>
            <input name="flock_age_weeks" type="number" className="input"
              placeholder="e.g., 24" min={0} />
          </div>
        </div>

        <div>
          <label>Suspected Condition / Disease *</label>
          <input name="condition_disease" type="text" className="input"
            placeholder="e.g., Newcastle Disease, Coccidiosis, Fowl Pox..." required />
        </div>

        <div>
          <label>Clinical Signs Observed</label>
          <textarea name="clinical_signs" className="input min-h-[80px]"
            placeholder="Describe what symptoms the birds are showing..." />
        </div>
      </div>

      {/* Bird counts */}
      <div className="form-section">
        <p className="section-title">Bird Count</p>

        <div className="form-row">
          <div>
            <label>Population at Risk</label>
            <input name="population_at_risk" type="number" className="input"
              placeholder="Total birds in the flock" min={0}
              value={popAtRisk} onChange={(e) => setPopAtRisk(e.target.value)} />
          </div>
          <div>
            <label>Number of Affected Birds *</label>
            <input name="num_affected" type="number" className="input"
              placeholder="Birds showing signs of illness" min={0}
              value={numAffected} onChange={(e) => setNumAffected(e.target.value)}
              required />
          </div>
        </div>

        {/* Live morbidity rate display */}
        {parseInt(popAtRisk) > 0 && parseInt(numAffected) > 0 && (
          <div className={`rounded-xl p-3 flex items-center gap-2 text-sm font-medium ${
            calcRate > 10 ? 'bg-red-50 text-red-700 border border-red-200' :
            calcRate > 5  ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-green-50 text-green-700 border border-green-200'
          }`}>
            <AlertTriangle size={14} />
            Calculated Morbidity Rate: <strong>{formatPct(calcRate)}</strong>
            {calcRate > 10 && ' — High morbidity detected. Consider veterinary consultation.'}
          </div>
        )}

        <div className="form-row-3">
          <div>
            <label>Recovered</label>
            <input name="num_recovered" type="number" className="input" defaultValue={0} min={0} />
          </div>
          <div>
            <label>Under Treatment</label>
            <input name="num_under_treatment" type="number" className="input" defaultValue={0} min={0} />
          </div>
          <div>
            <label>Referred</label>
            <input name="num_referred" type="number" className="input" defaultValue={0} min={0} />
          </div>
        </div>

        <div className="form-row">
          <div>
            <label>Culled (from this event)</label>
            <input name="num_culled" type="number" className="input" defaultValue={0} min={0} />
          </div>
          <div>
            <label>Subsequently Died</label>
            <input name="num_subsequently_died" type="number" className="input" defaultValue={0} min={0} />
          </div>
        </div>
      </div>

      {/* Treatment */}
      <div className="form-section">
        <p className="section-title">Treatment & Management</p>

        <div>
          <label>Treatment / Intervention</label>
          <textarea name="treatment_intervention" className="input min-h-[80px]"
            placeholder="What treatment or management action was taken?" />
        </div>

        <div className="form-row">
          <div>
            <label>Medication Used</label>
            <input name="medication_used" type="text" className="input"
              placeholder="Drug or supplement name..." />
          </div>
          <div>
            <label>Vaccination History</label>
            <input name="vaccination_history" type="text" className="input"
              placeholder="Recent vaccinations related to this event..." />
          </div>
        </div>

        <div className="form-row">
          <div>
            <label>Veterinarian / Technician</label>
            <input name="veterinarian" type="text" className="input"
              placeholder="Name of attending professional..." />
          </div>
          <div>
            <label>Responsible Person</label>
            <input name="responsible_person" type="text" className="input"
              placeholder="Farm staff handling this case..." />
          </div>
        </div>

        <div className="form-row">
          <div>
            <label>Duration (days)</label>
            <input name="duration_days" type="number" className="input"
              placeholder="How long has this been ongoing?" min={0} />
          </div>
          <div>
            <label>Current Outcome</label>
            <select name="outcome" className="select">
              {HEALTH_OUTCOMES.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label>Notes / Observations</label>
          <textarea name="notes" className="input min-h-[80px]"
            placeholder="Additional observations, context, or follow-up actions..." />
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" className="btn-primary flex-1" disabled={loading}>
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? 'Saving...' : 'Save Morbidity Record'}
        </button>
        <button type="button" className="btn-ghost"
          onClick={() => router.back()} disabled={loading}>
          Cancel
        </button>
      </div>

      <p className="text-xs text-gray-400 text-center">
        This system is a farm record and decision-support tool. It is not a replacement for
        a licensed veterinarian's diagnosis and professional advice.
      </p>
    </form>
  )
}
