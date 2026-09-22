'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { createFarm } from '@/app/actions/farms'

export default function NewFarmPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true); setError('')
    const result = await createFarm(new FormData(e.currentTarget))
    if (result?.error) { setError(result.error); toast.error(result.error); setLoading(false) }
    else toast.success('Farm created!')
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <h1 className="page-title mb-6">Create Farm Profile</h1>
      <form onSubmit={handleSubmit} className="card space-y-5">
        {error && <div className="alert-danger">{error}</div>}

        <div>
          <label>Farm Name *</label>
          <input name="name" type="text" className="input" required placeholder="e.g., Dela Cruz Layer Farm" />
        </div>

        <div>
          <label>Address</label>
          <input name="address" type="text" className="input" placeholder="Street / Sitio / Barangay" />
        </div>

        <div className="form-row-3">
          <div>
            <label>Municipality / City</label>
            <input name="municipality" type="text" className="input" />
          </div>
          <div>
            <label>Province</label>
            <input name="province" type="text" className="input" />
          </div>
          <div>
            <label>Region</label>
            <input name="region" type="text" className="input" placeholder="e.g., Region X" />
          </div>
        </div>

        <div className="form-row">
          <div>
            <label>Contact Person</label>
            <input name="contact_person" type="text" className="input" />
          </div>
          <div>
            <label>Contact Phone</label>
            <input name="contact_phone" type="tel" className="input" placeholder="09XXXXXXXXX" />
          </div>
        </div>

        <div>
          <label>Contact Email</label>
          <input name="contact_email" type="email" className="input" />
        </div>

        <div>
          <label>Notes</label>
          <textarea name="notes" className="input" rows={3} />
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn-primary flex-1" disabled={loading}>
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Creating...' : 'Create Farm'}
          </button>
          <button type="button" className="btn-ghost" onClick={() => router.back()}>Cancel</button>
        </div>
      </form>
    </div>
  )
}
