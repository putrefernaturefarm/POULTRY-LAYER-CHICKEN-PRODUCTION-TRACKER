'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Zap, Egg, UtensilsCrossed, AlertTriangle, Skull, ChevronRight } from 'lucide-react'
import { todayISO, formatPct } from '@/lib/utils'
import { henDayProduction, morbidityRate, goodEggPct } from '@/lib/calculations'
import { createDailyProduction } from '@/app/actions/production'
import { createMorbidityRecord } from '@/app/actions/morbidity'
import { createMortalityRecord } from '@/app/actions/mortality'

const STEPS = ['Eggs', 'Feed', 'Morbidity', 'Mortality', 'Done'] as const
type Step = typeof STEPS[number]

const SIZE_GRADES = [
  { key: 'eggs_jumbo',       label: 'Jumbo' },
  { key: 'eggs_extra_large', label: 'Extra Large' },
  { key: 'eggs_large',       label: 'Large' },
  { key: 'eggs_medium',      label: 'Medium' },
  { key: 'eggs_small',       label: 'Small' },
  { key: 'eggs_peewee',      label: 'Peewee' },
]

interface Props {
  flocks: { id: string; flock_code: string; breed_strain?: string | null }[]
  houses: { id: string; name: string }[]
}

export default function QuickEntryForm({ flocks, houses }: Props) {
  const router = useRouter()
  const [step,    setStep]    = useState<Step>('Eggs')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const [date,     setDate]     = useState(todayISO())
  const [flockId,  setFlockId]  = useState('')
  const [houseId,  setHouseId]  = useState('')
  const [hens,     setHens]     = useState('')
  const [eggs,     setEggs]     = useState('')
  const [goodEggs, setGoodEggs] = useState('')
  const [cracked,  setCracked]  = useState('0')
  const [dirty,    setDirty]    = useState('0')
  const [broken,   setBroken]   = useState('0')
  const [rejected, setRejected] = useState('0')
  const [otherLoss,setOtherLoss]= useState('0')
  const [notes,    setNotes]    = useState('')
  const [sizes, setSizes] = useState<Record<string, string>>({
    eggs_jumbo: '', eggs_extra_large: '', eggs_large: '',
    eggs_medium: '', eggs_small: '', eggs_peewee: '',
  })

  const [morb, setMorb] = useState({ affected: '', pop: '', condition: '' })
  const [mort, setMort] = useState({ deaths: '', pop: '', cause: '' })

  const hdp      = henDayProduction(parseInt(eggs) || 0, parseInt(hens) || 0)
  const goodPct  = goodEggPct(parseInt(goodEggs) || 0, parseInt(eggs) || 0)
  const mr       = morbidityRate(parseInt(morb.affected) || 0, parseInt(morb.pop) || parseInt(hens) || 0)
  const sizesSum = Object.values(sizes).reduce((s, v) => s + (parseInt(v) || 0), 0)
  const goodNum  = parseInt(goodEggs) || 0
  const sizesFilled   = sizesSum > 0
  const sizeMismatch  = sizesFilled && goodNum > 0 && sizesSum !== goodNum

  async function saveEggs() {
    if (!flockId)  { setError('Select a flock.'); return }
    if (!hens)     { setError('Enter number of hens present.'); return }
    if (!eggs)     { setError('Enter total eggs collected.'); return }
    if (!goodEggs) { setError('Enter good/saleable eggs.'); return }
    setLoading(true); setError('')
    const fd = new FormData()
    fd.set('flock_id',    flockId)
    fd.set('record_date', date)
    fd.set('hens_present', hens)
    fd.set('total_eggs',  eggs)
    fd.set('good_eggs',   goodEggs)
    fd.set('cracked_eggs',  cracked)
    fd.set('dirty_eggs',    dirty)
    fd.set('broken_eggs',   broken)
    fd.set('rejected_eggs', rejected)
    fd.set('other_losses',  otherLoss)
    fd.set('notes', notes)
    if (houseId) fd.set('house_id', houseId)
    SIZE_GRADES.forEach(({ key }) => fd.set(key, sizes[key] || '0'))
    const r = await createDailyProduction(fd)
    setLoading(false)
    if (r?.error) { toast.error(r.error); setError(r.error); return }
    toast.success('Eggs recorded.')
    setStep('Feed')
  }

  async function saveMorbidity() {
    if (!morb.affected || !morb.condition) { setStep('Mortality'); return }
    setLoading(true)
    const fd = new FormData()
    fd.set('flock_id', flockId)
    fd.set('record_date', date)
    fd.set('num_affected', morb.affected)
    fd.set('population_at_risk', morb.pop || hens)
    fd.set('condition_disease', morb.condition)
    const r = await createMorbidityRecord(fd)
    setLoading(false)
    if (r?.error) toast.error(r.error)
    else toast.success('Morbidity recorded.')
    setStep('Mortality')
  }

  async function saveMortality() {
    if (!mort.deaths || parseInt(mort.deaths) <= 0) { setStep('Done'); return }
    setLoading(true)
    const fd = new FormData()
    fd.set('flock_id', flockId)
    fd.set('record_date', date)
    fd.set('num_deaths', mort.deaths)
    fd.set('population_at_risk', mort.pop || hens)
    fd.set('suspected_cause', mort.cause)
    const r = await createMortalityRecord(fd)
    setLoading(false)
    if (r?.error) toast.error(r.error)
    else toast.success('Mortality recorded.')
    setStep('Done')
  }

  const stepIdx = STEPS.indexOf(step)

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Zap size={22} style={{ color: 'var(--green)' }} />
        <h1 className="page-title">Quick Daily Entry</h1>
      </div>

      {/* Progress */}
      <div className="flex gap-1 mb-2">
        {STEPS.slice(0, -1).map((s, i) => (
          <button
            key={s}
            onClick={() => i <= stepIdx && setStep(s)}
            className="flex-1 flex flex-col items-center gap-1 group"
            style={{ background: 'none', border: 'none', padding: '0 0 4px', cursor: i <= stepIdx ? 'pointer' : 'default' }}
          >
            <div
              className="h-1.5 w-full rounded-full transition-all"
              style={{
                background: i < stepIdx ? 'var(--green)' : i === stepIdx ? 'var(--green-bg)' : 'var(--line)',
                border: i === stepIdx ? '1px solid rgba(63,122,90,0.4)' : 'none',
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: i === stepIdx ? 'var(--green)' : i < stepIdx ? 'var(--ink-soft)' : 'var(--line-strong)',
                fontWeight: i === stepIdx ? 600 : 400,
              }}
            >
              {s}
            </span>
          </button>
        ))}
      </div>

      {error && <div className="alert-danger mb-4">{error}</div>}

      {flocks.length === 0 && step === 'Eggs' && (
        <div className="alert-warning mb-4">
          No active flocks found. <a href="/flocks/new" className="font-semibold underline">Add a flock first.</a>
        </div>
      )}

      {/* Step: Eggs */}
      {step === 'Eggs' && (
        <div className="card space-y-5">
          <p className="font-semibold flex items-center gap-2" style={{ fontFamily: 'var(--font-serif, serif)' }}>
            <Egg size={18} style={{ color: 'var(--amber)' }} /> Egg Production
          </p>

          {/* Flock + Date */}
          <div className="form-row">
            <div>
              <label>Flock *</label>
              <select className="select" value={flockId} onChange={e => setFlockId(e.target.value)} required>
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
              <input type="date" className="input" value={date}
                onChange={e => setDate(e.target.value)} max={todayISO()} />
            </div>
          </div>

          {/* House */}
          <div>
            <label>Poultry House</label>
            <select className="select" value={houseId} onChange={e => setHouseId(e.target.value)}>
              <option value="">Select house...</option>
              {houses.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
          </div>

          {/* Hens Present */}
          <div>
            <label>Number of Hens Present *</label>
            <input type="number" className="input" value={hens}
              onChange={e => setHens(e.target.value)} placeholder="Hens in lay today" min={0} />
          </div>

          {/* Egg Count */}
          <div>
            <p className="section-title mb-3">Egg Count</p>
            <div className="form-row">
              <div>
                <label>Total Eggs Collected *</label>
                <input type="number" className="input" value={eggs}
                  onChange={e => setEggs(e.target.value)} placeholder="All eggs" min={0} />
              </div>
              <div>
                <label>Good / Saleable Eggs *</label>
                <input type="number" className="input" value={goodEggs}
                  onChange={e => setGoodEggs(e.target.value)} placeholder="Marketable eggs" min={0} />
              </div>
            </div>

            {parseInt(hens) > 0 && parseInt(eggs) > 0 && (
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
              <div><label>Cracked</label><input type="number" className="input" value={cracked} onChange={e => setCracked(e.target.value)} min={0} /></div>
              <div><label>Dirty</label><input type="number" className="input" value={dirty} onChange={e => setDirty(e.target.value)} min={0} /></div>
              <div><label>Broken</label><input type="number" className="input" value={broken} onChange={e => setBroken(e.target.value)} min={0} /></div>
            </div>
            <div className="form-row mt-3">
              <div><label>Rejected</label><input type="number" className="input" value={rejected} onChange={e => setRejected(e.target.value)} min={0} /></div>
              <div><label>Other Losses</label><input type="number" className="input" value={otherLoss} onChange={e => setOtherLoss(e.target.value)} min={0} /></div>
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
            <textarea className="input" placeholder="Optional notes..." rows={2}
              value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          <button className="btn-primary w-full" onClick={saveEggs} disabled={loading || flocks.length === 0}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? 'Saving...' : 'Save Eggs'} <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Step: Feed */}
      {step === 'Feed' && (
        <div className="card space-y-4">
          <p className="font-semibold flex items-center gap-2" style={{ fontFamily: 'var(--font-serif, serif)' }}>
            <UtensilsCrossed size={18} style={{ color: 'var(--amber)' }} /> Feed Consumption
          </p>
          <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>Skip if not applicable today.</p>
          <button className="btn-primary w-full" onClick={() => setStep('Morbidity')}>
            Skip Feed <ChevronRight size={16} />
          </button>
          <button className="btn-ghost w-full" onClick={() => router.push('/feed/new')}>
            Go to Full Feed Form
          </button>
        </div>
      )}

      {/* Step: Morbidity */}
      {step === 'Morbidity' && (
        <div className="card space-y-4">
          <p className="font-semibold flex items-center gap-2" style={{ fontFamily: 'var(--font-serif, serif)' }}>
            <AlertTriangle size={18} style={{ color: 'var(--amber)' }} /> Morbidity (Sick Birds)
          </p>
          <div>
            <label>Affected Birds</label>
            <input type="number" className="input" value={morb.affected}
              onChange={e => setMorb({ ...morb, affected: e.target.value })} placeholder="0 if none" min={0} />
          </div>
          <div>
            <label>Condition / Signs</label>
            <input type="text" className="input" value={morb.condition}
              onChange={e => setMorb({ ...morb, condition: e.target.value })} placeholder="e.g., Off-feed, Diarrhea..." />
          </div>
          {parseInt(morb.affected) > 0 && parseInt(hens) > 0 && (
            <div className="rounded-xl p-2.5 text-sm" style={{ background: 'var(--amber-bg)', color: 'var(--amber)' }}>
              Morbidity Rate: <strong>{formatPct(mr)}</strong>
            </div>
          )}
          <div className="flex gap-2">
            <button className="btn-ghost flex-1" onClick={() => setStep('Mortality')}>Skip</button>
            <button className="btn-primary flex-1" onClick={saveMorbidity} disabled={loading}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              Save &amp; Next
            </button>
          </div>
        </div>
      )}

      {/* Step: Mortality */}
      {step === 'Mortality' && (
        <div className="card space-y-4">
          <p className="font-semibold flex items-center gap-2" style={{ fontFamily: 'var(--font-serif, serif)' }}>
            <Skull size={18} style={{ color: 'var(--red)' }} /> Mortality (Deaths)
          </p>
          <div>
            <label>Number of Deaths</label>
            <input type="number" className="input" value={mort.deaths}
              onChange={e => setMort({ ...mort, deaths: e.target.value })} placeholder="0 if none" min={0} />
          </div>
          <div>
            <label>Suspected Cause</label>
            <input type="text" className="input" value={mort.cause}
              onChange={e => setMort({ ...mort, cause: e.target.value })} placeholder="Optional..." />
          </div>
          <div className="flex gap-2">
            <button className="btn-ghost flex-1" onClick={() => setStep('Done')}>Skip</button>
            <button className="btn-primary flex-1" onClick={saveMortality} disabled={loading}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              Save &amp; Finish
            </button>
          </div>
        </div>
      )}

      {/* Step: Done */}
      {step === 'Done' && (
        <div className="card text-center py-10">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="page-title mb-2">Daily Record Complete</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--ink-soft)' }}>Farm records for {date} have been saved.</p>
          <div className="flex gap-3">
            <button className="btn-ghost flex-1" onClick={() => router.push('/dashboard')}>Dashboard</button>
            <button className="btn-primary flex-1" onClick={() => { setStep('Eggs'); setDate(todayISO()) }}>New Entry</button>
          </div>
        </div>
      )}
    </div>
  )
}
