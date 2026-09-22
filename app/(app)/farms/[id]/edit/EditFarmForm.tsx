'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { updateFarm } from '@/app/actions/farms'

interface Farm {
  id: string
  name: string
  address: string | null
  municipality: string | null
  province: string | null
  region: string | null
  contact_person: string | null
  contact_phone: string | null
  contact_email: string | null
  notes: string | null
}

export default function EditFarmForm({ farm }: { farm: Farm }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true); setError('')
    const result = await updateFarm(farm.id, new FormData(e.currentTarget))
    if (result?.error) { setError(result.error); toast.error(result.error); setLoading(false) }
    else toast.success('Farm updated!')
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      {error && <div className="alert-danger">{error}</div>}

      <div>
        <label>Farm Name *</label>
        <input name="name" type="text" className="input" required defaultValue={farm.name} />
      </div>

      <div>
        <label>Address</label>
        <input name="address" type="text" className="input" defaultValue={farm.address ?? ''} placeholder="Street / Sitio / Barangay" />
      </div>

      <div className="form-row-3">
        <div>
          <label>Municipality / City</label>
          <input name="municipality" type="text" className="input" defaultValue={farm.municipality ?? ''} />
        </div>
        <div>
          <label>Province</label>
          <input name="province" type="text" className="input" defaultValue={farm.province ?? ''} />
        </div>
        <div>
          <label>Region</label>
          <input name="region" type="text" className="input" defaultValue={farm.region ?? ''} placeholder="e.g., Region X" />
        </div>
      </div>

      <div className="form-row">
        <div>
          <label>Contact Person</label>
          <input name="contact_person" type="text" className="input" defaultValue={farm.contact_person ?? ''} />
        </div>
        <div>
          <label>Contact Phone</label>
          <input name="contact_phone" type="tel" className="input" defaultValue={farm.contact_phone ?? ''} placeholder="09XXXXXXXXX" />
        </div>
      </div>

      <div>
        <label>Contact Email</label>
        <input name="contact_email" type="email" className="input" defaultValue={farm.contact_email ?? ''} />
      </div>

      <div>
        <label>Notes</label>
        <textarea name="notes" className="input" rows={3} defaultValue={farm.notes ?? ''} />
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
