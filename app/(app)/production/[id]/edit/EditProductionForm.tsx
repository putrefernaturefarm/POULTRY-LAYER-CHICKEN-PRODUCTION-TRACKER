'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { updateProduction } from '@/app/actions/production'

interface Record {
  id: string; record_date: string; hens_present: number; total_eggs: number
  good_eggs: number; cracked_eggs: number; dirty_eggs: number; broken_eggs: number
  rejected_eggs: number; other_losses: number; notes: string | null
}

export default function EditProductionForm({ record }: { record: Record }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true); setError('')
    const result = await updateProduction(record.id, new FormData(e.currentTarget))
    if (result?.error) { setError(result.error); toast.error(result.error); setLoading(false) }
    else toast.success('Production record updated.')
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      {error && <div className="alert-danger">{error}</div>}

      <div className="alert-info text-sm">
        Date and flock cannot be changed. To correct those, delete this record and create a new one.
      </div>

      <div className="form-row">
        <div>
          <label>Hens Present *</label>
          <input name="hens_present" type="number" className="input" required min={0} defaultValue={record.hens_present} />
        </div>
        <div>
          <label>Total Eggs *</label>
          <input name="total_eggs" type="number" className="input" required min={0} defaultValue={record.total_eggs} />
        </div>
      </div>

      <div className="form-row">
        <div>
          <label>Good Eggs *</label>
          <input name="good_eggs" type="number" className="input" required min={0} defaultValue={record.good_eggs} />
        </div>
        <div>
          <label>Cracked</label>
          <input name="cracked_eggs" type="number" className="input" min={0} defaultValue={record.cracked_eggs} />
        </div>
      </div>

      <div className="form-row-3">
        <div>
          <label>Dirty</label>
          <input name="dirty_eggs" type="number" className="input" min={0} defaultValue={record.dirty_eggs} />
        </div>
        <div>
          <label>Broken</label>
          <input name="broken_eggs" type="number" className="input" min={0} defaultValue={record.broken_eggs} />
        </div>
        <div>
          <label>Rejected</label>
          <input name="rejected_eggs" type="number" className="input" min={0} defaultValue={record.rejected_eggs} />
        </div>
      </div>

      <div>
        <label>Other Losses</label>
        <input name="other_losses" type="number" className="input" min={0} defaultValue={record.other_losses} />
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
