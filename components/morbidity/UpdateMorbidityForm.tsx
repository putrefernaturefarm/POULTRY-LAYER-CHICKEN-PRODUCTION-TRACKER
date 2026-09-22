'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, CheckCircle } from 'lucide-react'
import { updateMorbidityRecord } from '@/app/actions/morbidity'
import { HEALTH_OUTCOMES } from '@/lib/constants'
import { todayISO } from '@/lib/utils'

export default function UpdateMorbidityForm({ record }: { record: Record<string, unknown> }) {
  const router  = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [isResolved, setIsResolved] = useState(Boolean(record.is_resolved))

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true); setError('')
    const result = await updateMorbidityRecord(record.id as string, new FormData(e.currentTarget))
    if (result?.error) { setError(result.error); toast.error(result.error); setLoading(false) }
    else toast.success('Record updated.')
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      {error && <div className="alert-danger">{error}</div>}

      <div className="bg-gray-50 rounded-xl p-3 text-sm">
        <p className="font-semibold text-gray-700">Case summary</p>
        <p className="text-gray-500 mt-1">
          Affected: <strong>{record.num_affected as number}</strong> birds &nbsp;|&nbsp;
          Condition: <strong>{record.condition_disease as string}</strong>
        </p>
      </div>

      <div className="form-row-3">
        <div>
          <label>Recovered</label>
          <input name="num_recovered" type="number" className="input"
            defaultValue={Number(record.num_recovered)} min={0} />
        </div>
        <div>
          <label>Under Treatment</label>
          <input name="num_under_treatment" type="number" className="input"
            defaultValue={Number(record.num_under_treatment)} min={0} />
        </div>
        <div>
          <label>Culled</label>
          <input name="num_culled" type="number" className="input"
            defaultValue={Number(record.num_culled)} min={0} />
        </div>
      </div>

      <div>
        <label>Subsequently Died</label>
        <input name="num_subsequently_died" type="number" className="input"
          defaultValue={Number(record.num_subsequently_died)} min={0} />
        <p className="text-xs text-gray-400 mt-1">
          Birds that progressed from morbidity to death — also record separately in Mortality.
        </p>
      </div>

      <div>
        <label>Current Outcome</label>
        <select name="outcome" className="select" defaultValue={record.outcome as string}>
          {HEALTH_OUTCOMES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="is_resolved" value="true"
            checked={isResolved} onChange={e => setIsResolved(e.target.checked)} />
          <span className="flex items-center gap-1">
            <CheckCircle size={14} className={isResolved ? 'text-green-600' : 'text-gray-300'} />
            Mark this case as resolved
          </span>
        </label>
      </div>

      {isResolved && (
        <div>
          <label>Resolution Date</label>
          <input name="resolved_date" type="date" className="input" defaultValue={todayISO()} />
        </div>
      )}

      <div>
        <label>Updated Notes</label>
        <textarea name="notes" className="input" rows={3}
          defaultValue={record.notes as string ?? ''} />
      </div>

      <div className="flex gap-3">
        <button type="submit" className="btn-primary flex-1" disabled={loading}>
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? 'Updating...' : 'Update Record'}
        </button>
        <button type="button" className="btn-ghost" onClick={() => router.back()}>Cancel</button>
      </div>
    </form>
  )
}
