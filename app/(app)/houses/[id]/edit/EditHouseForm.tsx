'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { updateHouse } from '@/app/actions/houses'
import { HOUSING_TYPES } from '@/lib/constants'

interface House {
  id: string; name: string; code: string | null; housing_type: string | null
  capacity: number | null; description: string | null; is_active: boolean
}

export default function EditHouseForm({ house }: { house: House }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true); setError('')
    const result = await updateHouse(house.id, new FormData(e.currentTarget))
    if (result?.error) { setError(result.error); toast.error(result.error); setLoading(false) }
    else toast.success('House updated.')
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      {error && <div className="alert-danger">{error}</div>}

      <div className="form-row">
        <div>
          <label>House Name *</label>
          <input name="name" type="text" className="input" required defaultValue={house.name} />
        </div>
        <div>
          <label>Code / Label</label>
          <input name="code" type="text" className="input" defaultValue={house.code ?? ''} />
        </div>
      </div>

      <div className="form-row">
        <div>
          <label>Housing Type</label>
          <select name="housing_type" className="select" defaultValue={house.housing_type ?? ''}>
            <option value="">Select type...</option>
            {HOUSING_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label>Capacity (birds)</label>
          <input name="capacity" type="number" className="input" min={0} defaultValue={house.capacity ?? ''} />
        </div>
      </div>

      <div>
        <label>Status</label>
        <select name="is_active" className="select" defaultValue={house.is_active ? 'true' : 'false'}>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      <div>
        <label>Description / Notes</label>
        <textarea name="description" className="input" rows={2} defaultValue={house.description ?? ''} />
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
