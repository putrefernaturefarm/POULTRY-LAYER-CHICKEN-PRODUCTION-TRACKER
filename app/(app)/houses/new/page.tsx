'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { HOUSING_TYPES } from '@/lib/constants'
import { useFarmStore } from '@/store/farm'

export default function NewHousePage() {
  const router = useRouter()
  const farm   = useFarmStore(s => s.farm)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!farm?.id) { setError('No farm selected.'); return }
    setLoading(true); setError('')

    const fd   = new FormData(e.currentTarget)
    const supabase = createClient()
    const { error: err } = await supabase.from('poultry_houses').insert({
      farm_id:      farm.id,
      name:         String(fd.get('name') ?? ''),
      code:         String(fd.get('code') ?? '') || null,
      housing_type: fd.get('housing_type') || null,
      capacity:     parseInt(String(fd.get('capacity') ?? '0')) || null,
      description:  String(fd.get('description') ?? '') || null,
    })

    setLoading(false)
    if (err) { setError(err.message); toast.error(err.message); return }
    toast.success('House added.')
    router.push('/houses')
  }

  return (
    <div className="p-4 md:p-6 max-w-xl mx-auto">
      <h1 className="page-title mb-6">Add Poultry House</h1>
      <form onSubmit={handleSubmit} className="card space-y-5">
        {error && <div className="alert-danger">{error}</div>}

        <div className="form-row">
          <div>
            <label>House Name *</label>
            <input name="name" type="text" className="input" required placeholder="e.g., House A" />
          </div>
          <div>
            <label>Code / Label</label>
            <input name="code" type="text" className="input" placeholder="e.g., H1" />
          </div>
        </div>

        <div className="form-row">
          <div>
            <label>Housing Type</label>
            <select name="housing_type" className="select">
              <option value="">Select type...</option>
              {HOUSING_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label>Capacity (birds)</label>
            <input name="capacity" type="number" className="input" placeholder="Max bird capacity" min={0} />
          </div>
        </div>

        <div>
          <label>Description / Notes</label>
          <textarea name="description" className="input" rows={2} />
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn-primary flex-1" disabled={loading}>
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Saving...' : 'Add House'}
          </button>
          <button type="button" className="btn-ghost" onClick={() => router.back()}>Cancel</button>
        </div>
      </form>
    </div>
  )
}
