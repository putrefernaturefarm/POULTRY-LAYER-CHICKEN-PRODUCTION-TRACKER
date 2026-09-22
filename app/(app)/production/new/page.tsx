'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { createDailyProduction } from '@/app/actions/production'
import { todayISO, formatPct } from '@/lib/utils'
import { henDayProduction, goodEggPct } from '@/lib/calculations'

export default function NewProductionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [flocks, setFlocks]   = useState<{id:string;flock_code:string}[]>([])
  const [houses, setHouses]   = useState<{id:string;name:string}[]>([])
  const [hens,   setHens]     = useState('')
  const [total,  setTotal]    = useState('')
  const [good,   setGood]     = useState('')

  const hdp      = henDayProduction(parseInt(total)||0, parseInt(hens)||0)
  const goodPct  = goodEggPct(parseInt(good)||0, parseInt(total)||0)

  useEffect(() => {
    fetch('/api/farm-data').then(r => r.json()).then(d => {
      setFlocks(d.flocks ?? [])
      setHouses(d.houses ?? [])
    }).catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true); setError('')
    const fd = new FormData(e.currentTarget)
    const result = await createDailyProduction(fd)
    if (result?.error) {
      setError(result.error)
      toast.error(result.error)
      setLoading(false)
    } else {
      toast.success('Production recorded.')
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="page-title">Record Egg Production</h1>
        <p className="text-sm text-gray-500 mt-0.5">Daily egg collection for a flock</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        {error && <div className="alert-danger">{error}</div>}

        <div className="form-row">
          <div>
            <label>Flock *</label>
            <select name="flock_id" className="select" required>
              <option value="">Select flock...</option>
              {flocks.map(f => <option key={f.id} value={f.id}>{f.flock_code}</option>)}
            </select>
          </div>
          <div>
            <label>Record Date *</label>
            <input name="record_date" type="date" className="input"
              defaultValue={todayISO()} max={todayISO()} required />
          </div>
        </div>

        <div>
          <label>Poultry House</label>
          <select name="house_id" className="select">
            <option value="">Select house...</option>
            {houses.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
        </div>

        <div>
          <label>Number of Hens Present *</label>
          <input name="hens_present" type="number" className="input"
            placeholder="Hens in lay today" min={0} value={hens}
            onChange={e => setHens(e.target.value)} required />
        </div>

        <div>
          <p className="section-title mb-3">Egg Count</p>
          <div className="form-row">
            <div>
              <label>Total Eggs Collected *</label>
              <input name="total_eggs" type="number" className="input"
                placeholder="All eggs" min={0} value={total}
                onChange={e => setTotal(e.target.value)} required />
            </div>
            <div>
              <label>Good / Saleable Eggs *</label>
              <input name="good_eggs" type="number" className="input"
                placeholder="Marketable eggs" min={0} value={good}
                onChange={e => setGood(e.target.value)} required />
            </div>
          </div>

          {/* Live calculations */}
          {parseInt(hens) > 0 && parseInt(total) > 0 && (
            <div className="bg-farm-green-50 border border-farm-green-200 rounded-xl p-3 mt-3">
              <p className="text-xs font-semibold text-farm-green-700 mb-1">Live Calculations</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Hen-Day Production: </span>
                  <span className="font-bold text-farm-green-700">{formatPct(hdp)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Good Egg %: </span>
                  <span className="font-bold text-farm-green-700">{formatPct(goodPct)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="form-row-3 mt-3">
            <div>
              <label>Cracked</label>
              <input name="cracked_eggs" type="number" className="input" defaultValue={0} min={0} />
            </div>
            <div>
              <label>Dirty</label>
              <input name="dirty_eggs" type="number" className="input" defaultValue={0} min={0} />
            </div>
            <div>
              <label>Broken</label>
              <input name="broken_eggs" type="number" className="input" defaultValue={0} min={0} />
            </div>
          </div>
          <div className="form-row mt-3">
            <div>
              <label>Rejected</label>
              <input name="rejected_eggs" type="number" className="input" defaultValue={0} min={0} />
            </div>
            <div>
              <label>Other Losses</label>
              <input name="other_losses" type="number" className="input" defaultValue={0} min={0} />
            </div>
          </div>
        </div>

        <div>
          <label>Notes</label>
          <textarea name="notes" className="input" placeholder="Optional notes..." rows={2} />
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn-primary flex-1" disabled={loading}>
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Saving...' : 'Save Production Record'}
          </button>
          <button type="button" className="btn-ghost" onClick={() => router.back()}>Cancel</button>
        </div>
      </form>
    </div>
  )
}
