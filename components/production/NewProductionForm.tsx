'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { createDailyProduction } from '@/app/actions/production'
import { todayISO, formatPct } from '@/lib/utils'
import { henDayProduction, goodEggPct } from '@/lib/calculations'

interface Props {
  farmId: string
  flocks: { id: string; flock_code: string; breed_strain?: string | null }[]
  houses: { id: string; name: string }[]
}

const SIZE_GRADES = [
  { key: 'eggs_jumbo',       label: 'Jumbo' },
  { key: 'eggs_extra_large', label: 'Extra Large' },
  { key: 'eggs_large',       label: 'Large' },
  { key: 'eggs_medium',      label: 'Medium' },
  { key: 'eggs_small',       label: 'Small' },
  { key: 'eggs_peewee',      label: 'Peewee' },
]

export default function NewProductionForm({ flocks, houses }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [hens,    setHens]    = useState('')
  const [total,   setTotal]   = useState('')
  const [good,    setGood]    = useState('')

  const [sizes, setSizes] = useState<Record<string, string>>({
    eggs_jumbo: '', eggs_extra_large: '', eggs_large: '',
    eggs_medium: '', eggs_small: '', eggs_peewee: '',
  })

  const hdp       = henDayProduction(parseInt(total) || 0, parseInt(hens) || 0)
  const goodPct   = goodEggPct(parseInt(good) || 0, parseInt(total) || 0)
  const sizesSum  = Object.values(sizes).reduce((s, v) => s + (parseInt(v) || 0), 0)
  const goodNum   = parseInt(good) || 0
  const sizesFilled = sizesSum > 0
  const sizeMismatch = sizesFilled && goodNum > 0 && sizesSum !== goodNum

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await createDailyProduction(new FormData(e.currentTarget))
    if (result?.error) {
      setError(result.error)
      toast.error(result.error)
      setLoading(false)
    } else {
      toast.success('Production recorded.')
      router.push('/production')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-6">
      {error && <div className="alert-danger">{error}</div>}

      {flocks.length === 0 && (
        <div className="alert-warning">
          No active flocks found. <a href="/flocks/new" className="font-semibold underline">Add a flock first.</a>
        </div>
      )}

      {/* Flock + Date */}
      <div className="form-row">
        <div>
          <label>Flock *</label>
          <select name="flock_id" className="select" required>
            <option value="">Select flock...</option>
            {flocks.map(f => (
              <option key={f.id} value={f.id}>
                {f.flock_code}{f.breed_strain ? ` — ${f.breed_strain}` : ''}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Record Date *</label>
          <input name="record_date" type="date" className="input" defaultValue={todayISO()} max={todayISO()} required />
        </div>
      </div>

      {/* House */}
      <div>
        <label>Poultry House</label>
        <select name="house_id" className="select">
          <option value="">Select house...</option>
          {houses.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
        </select>
      </div>

      {/* Hens present */}
      <div>
        <label>Number of Hens Present *</label>
        <input name="hens_present" type="number" className="input" placeholder="Hens in lay today"
          min={0} value={hens} onChange={e => setHens(e.target.value)} required />
      </div>

      {/* Egg Count */}
      <div>
        <p className="section-title mb-3">Egg Count</p>
        <div className="form-row">
          <div>
            <label>Total Eggs Collected *</label>
            <input name="total_eggs" type="number" className="input" placeholder="All eggs"
              min={0} value={total} onChange={e => setTotal(e.target.value)} required />
          </div>
          <div>
            <label>Good / Saleable Eggs *</label>
            <input name="good_eggs" type="number" className="input" placeholder="Marketable eggs"
              min={0} value={good} onChange={e => setGood(e.target.value)} required />
          </div>
        </div>

        {parseInt(hens) > 0 && parseInt(total) > 0 && (
          <div className="rounded-xl p-3 mt-3" style={{ background: 'var(--green-bg)', border: '1px solid rgba(63,122,90,0.2)' }}>
            <p className="text-xs font-semibold mb-1" style={{ fontFamily: 'var(--font-mono)', color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Live Calculations
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span style={{ color: 'var(--ink-soft)' }}>Hen-Day Production: </span>
                <span className="font-bold" style={{ color: 'var(--green)' }}>{formatPct(hdp)}</span>
              </div>
              <div>
                <span style={{ color: 'var(--ink-soft)' }}>Good Egg %: </span>
                <span className="font-bold" style={{ color: 'var(--green)' }}>{formatPct(goodPct)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="form-row-3 mt-3">
          <div><label>Cracked</label><input name="cracked_eggs" type="number" className="input" defaultValue={0} min={0} /></div>
          <div><label>Dirty</label><input name="dirty_eggs" type="number" className="input" defaultValue={0} min={0} /></div>
          <div><label>Broken</label><input name="broken_eggs" type="number" className="input" defaultValue={0} min={0} /></div>
        </div>
        <div className="form-row mt-3">
          <div><label>Rejected</label><input name="rejected_eggs" type="number" className="input" defaultValue={0} min={0} /></div>
          <div><label>Other Losses</label><input name="other_losses" type="number" className="input" defaultValue={0} min={0} /></div>
        </div>
      </div>

      {/* Egg Sizes */}
      <div>
        <p className="section-title mb-1">Egg Sizes</p>
        <p className="text-xs mb-3" style={{ color: 'var(--ink-muted)' }}>
          Optional — breakdown of good eggs by size grade
        </p>

        <div className="grid grid-cols-3 gap-3">
          {SIZE_GRADES.map(({ key, label }) => (
            <div key={key}>
              <label>{label}</label>
              <input
                name={key}
                type="number"
                className="input"
                min={0}
                placeholder="0"
                value={sizes[key]}
                onChange={e => setSizes(prev => ({ ...prev, [key]: e.target.value }))}
              />
            </div>
          ))}
        </div>

        {sizesFilled && (
          <div
            className="rounded-lg px-3 py-2 mt-3 flex items-center justify-between text-sm"
            style={{
              background: sizeMismatch ? 'rgba(200,60,60,0.07)' : 'var(--green-bg)',
              border: `1px solid ${sizeMismatch ? 'rgba(200,60,60,0.3)' : 'rgba(63,122,90,0.2)'}`,
            }}
          >
            <span style={{ color: 'var(--ink-soft)' }}>
              Sizes total: <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink)' }}>{sizesSum}</strong>
            </span>
            {sizeMismatch ? (
              <span style={{ color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                ≠ {goodNum} good eggs
              </span>
            ) : (
              <span style={{ color: 'var(--green)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                ✓ matches good eggs
              </span>
            )}
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <label>Notes</label>
        <textarea name="notes" className="input" placeholder="Optional notes..." rows={2} />
      </div>

      <div className="flex gap-3">
        <button type="submit" className="btn-primary flex-1" disabled={loading || flocks.length === 0}>
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? 'Saving...' : 'Save Production Record'}
        </button>
        <button type="button" className="btn-ghost" onClick={() => router.back()}>Cancel</button>
      </div>
    </form>
  )
}
