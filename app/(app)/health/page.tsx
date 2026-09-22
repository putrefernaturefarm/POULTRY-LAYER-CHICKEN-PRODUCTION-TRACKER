import { requireUser, getCurrentFarm } from '@/lib/session'
import { getMorbidityRecords, getMorbiditySummary } from '@/app/actions/morbidity'
import { getMortalityRecords, getMortalitySummary } from '@/app/actions/mortality'
import { formatDate, formatPct, formatNumber, cn } from '@/lib/utils'
import { Heart, AlertTriangle, Skull, Plus, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Health | LayerPro' }

export default async function HealthPage() {
  await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) return <div className="p-6"><p style={{ color: 'var(--ink-soft)' }}>No farm found.</p></div>

  const [morbRecords, morbSummary, mortRecords, mortSummary] = await Promise.all([
    getMorbidityRecords(farm.id, 10),
    getMorbiditySummary(farm.id),
    getMortalityRecords(farm.id, 10),
    getMortalitySummary(farm.id),
  ])

  const activeMorbidity = morbRecords.filter(r => !r.is_resolved)

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Heart size={22} style={{ color: 'var(--red)' }} /> Health Overview
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--ink-soft)' }}>
            Active cases, recent mortality, and flock health status
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/morbidity/new" className="btn-primary">
            <Plus size={14} /> Log Morbidity
          </Link>
          <Link href="/mortality/new" className="btn-ghost">
            <Plus size={14} /> Log Mortality
          </Link>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="stat-card" style={{ borderLeft: '4px solid var(--amber)' }}>
          <span className="stat-label">Active Cases</span>
          <span className="stat-value" style={{ color: 'var(--amber)' }}>
            {morbSummary.activeCaseCount}
          </span>
          <span className="stat-sub">unresolved events</span>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--red)' }}>
          <span className="stat-label">Affected Birds</span>
          <span className="stat-value" style={{ color: 'var(--red)' }}>
            {formatNumber(morbSummary.totalAffected)}
          </span>
          <span className="stat-sub">in active cases</span>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #6b6b6b' }}>
          <span className="stat-label">Monthly Deaths</span>
          <span className="stat-value">{mortSummary.monthlyDeaths}</span>
          <span className="stat-sub">this month</span>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--green)' }}>
          <span className="stat-label">Under Treatment</span>
          <span className="stat-value" style={{ color: 'var(--green)' }}>
            {formatNumber(morbSummary.totalUnderTreatment)}
          </span>
          <span className="stat-sub">birds on medication</span>
        </div>
      </div>

      {/* Active Morbidity + Recent Mortality side by side on large screens */}
      <div className="grid lg:grid-cols-2 gap-5">

        {/* Active Morbidity */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold flex items-center gap-1.5" style={{ color: 'var(--ink)' }}>
              <AlertTriangle size={15} style={{ color: 'var(--amber)' }} /> Active Morbidity Cases
            </h3>
            <Link
              href="/morbidity"
              className="text-xs font-medium flex items-center gap-1"
              style={{ color: 'var(--green)', fontFamily: 'var(--font-mono)' }}
            >
              View all <ArrowRight size={11} />
            </Link>
          </div>

          {activeMorbidity.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>No active cases</p>
              <Link href="/morbidity/new" className="btn-primary mt-3 inline-flex text-xs">
                <Plus size={13} /> Log Event
              </Link>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--line)' }}>
              {activeMorbidity.map(r => (
                <div key={r.id} className="px-4 py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: 'var(--ink)' }}>
                      {r.condition_disease}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--ink-muted)' }}>
                      {(r.flocks as { flock_code: string })?.flock_code ?? '—'} · {formatDate(r.record_date)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm" style={{ color: 'var(--amber)' }}>
                      {r.num_affected} birds
                    </p>
                    <span
                      className="badge text-xs"
                      style={{
                        color: 'var(--amber)',
                        borderColor: 'var(--amber)',
                        background: 'var(--paper-2)'
                      }}
                    >
                      Active
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Mortality */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold flex items-center gap-1.5" style={{ color: 'var(--ink)' }}>
              <Skull size={15} style={{ color: 'var(--ink-soft)' }} /> Recent Mortality
            </h3>
            <Link
              href="/mortality"
              className="text-xs font-medium flex items-center gap-1"
              style={{ color: 'var(--green)', fontFamily: 'var(--font-mono)' }}
            >
              View all <ArrowRight size={11} />
            </Link>
          </div>

          {mortRecords.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>No mortality recorded</p>
              <Link href="/mortality/new" className="btn-ghost mt-3 inline-flex text-xs">
                <Plus size={13} /> Log Mortality
              </Link>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--line)' }}>
              {mortRecords.map(r => (
                <div key={r.id} className="px-4 py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: 'var(--ink)' }}>
                      {r.suspected_cause || 'Unknown cause'}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--ink-muted)' }}>
                      {(r.flocks as { flock_code: string })?.flock_code ?? '—'} · {formatDate(r.record_date)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm" style={{ color: 'var(--red)' }}>
                      {r.num_deaths} dead
                    </p>
                    <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                      {formatPct(r.mortality_rate ?? 0)} rate
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick links to related modules */}
      <div
        className="rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-3"
        style={{ background: 'var(--paper-2)', border: '1px solid var(--line-strong)' }}
      >
        {[
          { href: '/vaccination', label: 'Vaccination', desc: 'Vaccine schedule' },
          { href: '/medication',  label: 'Medication',  desc: 'Treatment records' },
          { href: '/culling',     label: 'Culling',     desc: 'Culled birds' },
          { href: '/reports/health', label: 'Health Report', desc: '30-day summary' },
        ].map(({ href, label, desc }) => (
          <Link
            key={href}
            href={href}
            className="block rounded-lg p-3 transition-colors hover:opacity-80"
            style={{ background: 'var(--paper)', border: '1px solid var(--line)' }}
          >
            <p className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>{label}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--ink-muted)' }}>{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
