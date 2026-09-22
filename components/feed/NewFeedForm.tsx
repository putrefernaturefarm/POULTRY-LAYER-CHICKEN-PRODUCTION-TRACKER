'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Info } from 'lucide-react'
import { createFeedRecord } from '@/app/actions/feed'
import { FEED_TYPES } from '@/lib/constants'
import Link from 'next/link'

interface Flock {
  id: string
  flock_code: string
  breed_strain?: string | null
  initial_population?: number | null
}

interface House { id: string; name: string }

interface Props {
  farmId: string
  flocks: Flock[]
  houses: House[]
}

export default function NewFeedForm({ flocks, houses }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const today = new Date().toISOString().split('T')[0]

  const [selectedFlock, setSelectedFlock] = useState(flocks[0]?.id ?? '')
  const [numBags,    setNumBags]    = useState('')
  const [bagSize,    setBagSize]    = useState('')
  const [directKg,   setDirectKg]   = useState('')
  const [costPerBag, setCostPerBag] = useState('')
  const [directCost, setDirectCost] = useState('')
  const [hens,       setHens]       = useState('')

  const useBags = numBags !== '' || bagSize !== ''

  const calcKg = (() => {
    const bags = parseFloat(numBags)
    const kg   = parseFloat(bagSize)
    if (!isNaN(bags) && !isNaN(kg) && bags > 0 && kg > 0) return bags * kg
    const dk = parseFloat(directKg)
    return isNaN(dk) ? 0 : dk
  })()

  const calcCost = (() => {
    const bags = parseFloat(numBags)
    const cpb  = parseFloat(costPerBag)
    if (!isNaN(bags) && !isNaN(cpb) && bags > 0 && cpb > 0) return bags * cpb
    const dc = parseFloat(directCost)
    return isNaN(dc) ? 0 : dc
  })()

  const hensNum  = parseInt(hens) || 0
  const feedPerBird = hensNum > 0 && calcKg > 0 ? (calcKg * 1000) / hensNum : 0

  const flockObj = flocks.find(f => f.id === selectedFlock)

  useEffect(() => {
    if (flockObj?.initial_population && hens === '') {
      setHens(String(flockObj.initial_population))
    }
  }, [selectedFlock])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const fd = new FormData(e.currentTarget)
    fd.set('quantity_kg', String(calcKg || ''))
    fd.set('total_cost',  String(calcCost || ''))

    const result = await createFeedRecord(fd)
    if (result?.error) {
      setError(result.error)
      toast.error(result.error)
      setLoading(false)
    } else {
      toast.success('Feed record saved.')
    }
  }

  if (flocks.length === 0) {
    return (
      <div className="card">
        <div className="alert-warning flex items-start gap-2">
          <Info size={16} style={{ marginTop: 2, flexShrink: 0 }} />
          <span>
            No active flocks found.{' '}
            <Link href="/flocks/new" style={{ color: 'var(--amber)', fontWeight: 600 }}>
              Create a flock
            </Link>{' '}
            before logging feed.
          </span>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="alert-danger">{error}</div>}

      {/* Section 1 — Date & Flock */}
      <div className="card space-y-4">
        <h3 className="font-semibold text-sm uppercase tracking-wide" style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold)' }}>
          1 — Record Info
        </h3>
        <div className="form-row">
          <div>
            <label>Date *</label>
            <input name="record_date" type="date" className="input" required defaultValue={today} />
          </div>
          <div>
            <label>Flock *</label>
            <select
              name="flock_id"
              className="select"
              required
              value={selectedFlock}
              onChange={e => setSelectedFlock(e.target.value)}
            >
              {flocks.map(f => (
                <option key={f.id} value={f.id}>
                  {f.flock_code}{f.breed_strain ? ` — ${f.breed_strain}` : ''}
                </option>
              ))}
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
      </div>

      {/* Section 2 — Feed Type */}
      <div className="card space-y-4">
        <h3 className="font-semibold text-sm uppercase tracking-wide" style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold)' }}>
          2 — Feed Type
        </h3>
        <div className="form-row">
          <div>
            <label>Feed Type *</label>
            <select name="feed_type" className="select" required>
              <option value="">Select...</option>
              {FEED_TYPES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
          <div>
            <label>Brand / Supplier</label>
            <input name="brand" type="text" className="input" placeholder="e.g. San Miguel, B-MEG" />
          </div>
        </div>
      </div>

      {/* Section 3 — Quantity */}
      <div className="card space-y-4">
        <h3 className="font-semibold text-sm uppercase tracking-wide" style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold)' }}>
          3 — Quantity
        </h3>
        <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>
          Enter by bags (auto-calculates kg) or type kg directly.
        </p>
        <div className="form-row">
          <div>
            <label>No. of Bags</label>
            <input
              name="num_bags"
              type="number"
              step="0.5"
              min="0"
              className="input"
              placeholder="e.g. 2"
              value={numBags}
              onChange={e => setNumBags(e.target.value)}
            />
          </div>
          <div>
            <label>Bag Size (kg)</label>
            <input
              name="bag_size_kg"
              type="number"
              step="0.5"
              min="0"
              className="input"
              placeholder="e.g. 50"
              value={bagSize}
              onChange={e => setBagSize(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label>
            Total Quantity (kg){useBags && calcKg > 0 ? ' — auto-calculated' : ' *'}
          </label>
          <input
            name="quantity_kg"
            type="number"
            step="0.001"
            min="0"
            className="input"
            placeholder="e.g. 100"
            value={useBags && calcKg > 0 ? calcKg.toFixed(3) : directKg}
            onChange={e => { if (!useBags || calcKg === 0) setDirectKg(e.target.value) }}
            readOnly={useBags && calcKg > 0}
            required={!useBags || calcKg === 0}
            style={useBags && calcKg > 0 ? { background: 'var(--paper-2)', color: 'var(--ink-soft)' } : {}}
          />
        </div>
      </div>

      {/* Section 4 — Cost */}
      <div className="card space-y-4">
        <h3 className="font-semibold text-sm uppercase tracking-wide" style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold)' }}>
          4 — Cost
        </h3>
        <div className="form-row">
          <div>
            <label>Cost per Bag (₱)</label>
            <input
              name="cost_per_bag"
              type="number"
              step="0.01"
              min="0"
              className="input"
              placeholder="e.g. 1850"
              value={costPerBag}
              onChange={e => setCostPerBag(e.target.value)}
            />
          </div>
          <div>
            <label>
              Total Cost (₱){costPerBag && numBags ? ' — auto-calculated' : ''}
            </label>
            <input
              name="total_cost"
              type="number"
              step="0.01"
              min="0"
              className="input"
              placeholder="e.g. 3700"
              value={calcCost > 0 ? calcCost.toFixed(2) : directCost}
              onChange={e => { if (calcCost === 0) setDirectCost(e.target.value) }}
              readOnly={calcCost > 0}
              style={calcCost > 0 ? { background: 'var(--paper-2)', color: 'var(--ink-soft)' } : {}}
            />
          </div>
        </div>
      </div>

      {/* Section 5 — Hens & Notes */}
      <div className="card space-y-4">
        <h3 className="font-semibold text-sm uppercase tracking-wide" style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold)' }}>
          5 — Flock Details
        </h3>
        <div>
          <label>Hens Present</label>
          <input
            name="hens_present"
            type="number"
            min="0"
            className="input"
            placeholder="e.g. 500"
            value={hens}
            onChange={e => setHens(e.target.value)}
          />
        </div>
        <div>
          <label>Notes</label>
          <textarea name="notes" className="input" rows={2} placeholder="Optional notes..." />
        </div>
      </div>

      {/* Live Preview */}
      {(calcKg > 0 || calcCost > 0) && (
        <div className="card" style={{ background: 'var(--paper-2)', border: '1px solid var(--line-strong)' }}>
          <h3 className="font-semibold text-sm uppercase tracking-wide mb-3" style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold)' }}>
            Preview
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink)' }}>
                {calcKg.toFixed(1)}
              </div>
              <div className="text-xs mt-0.5" style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>kg consumed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--amber)' }}>
                {calcCost > 0 ? `₱${calcCost.toFixed(0)}` : '—'}
              </div>
              <div className="text-xs mt-0.5" style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>total cost</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--green)' }}>
                {feedPerBird > 0 ? `${feedPerBird.toFixed(0)}g` : '—'}
              </div>
              <div className="text-xs mt-0.5" style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>g / bird / day</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button type="submit" className="btn-primary flex-1" disabled={loading}>
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? 'Saving...' : 'Save Feed Record'}
        </button>
        <button type="button" className="btn-ghost" onClick={() => router.back()}>Cancel</button>
      </div>
    </form>
  )
}
