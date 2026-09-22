import { requireUser, getCurrentFarm } from '@/lib/session'
import { getMedicationRecords, getMedicationSummary, deleteMedicationRecord } from '@/app/actions/medication'
import { formatDate } from '@/lib/utils'
import { Pill, Plus, Pencil, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { MEDICATION_ROUTES } from '@/lib/constants'
import DeleteButton from '@/components/shared/DeleteButton'

export const metadata = { title: 'Medication | LayerPro' }

export default async function MedicationPage() {
  await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) return <div className="p-6"><p style={{ color: 'var(--ink-soft)' }}>No farm found.</p></div>

  const [records, summary] = await Promise.all([
    getMedicationRecords(farm.id),
    getMedicationSummary(farm.id),
  ])

  const routeLabel = (v: string) => MEDICATION_ROUTES.find(r => r.value === v)?.label ?? v

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Pill size={22} style={{ color: '#9b59b6' }} /> Medication Records
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--ink-soft)' }}>{farm.name}</p>
        </div>
        <Link href="/medication/new" className="btn-primary"><Plus size={16} /> Log Medication</Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="stat-card" style={{ borderLeft: '4px solid #9b59b6' }}>
          <span className="stat-label">This Month</span>
          <span className="stat-value" style={{ color: '#9b59b6' }}>{summary.monthCount}</span>
          <span className="stat-sub">treatments logged</span>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--amber)' }}>
          <span className="stat-label">Active Treatments</span>
          <span className="stat-value" style={{ color: 'var(--amber)' }}>{summary.activeTreatments.length}</span>
          <span className="stat-sub">ongoing</span>
        </div>
      </div>

      {summary.activeTreatments.length > 0 && (
        <div className="card" style={{ border: '1px solid var(--amber)', background: 'var(--paper-2)' }}>
          <div className="card-header">
            <h3 className="font-semibold flex items-center gap-1.5 text-sm" style={{ color: 'var(--amber)' }}>
              <AlertCircle size={14} /> Active / Ongoing Treatments
            </h3>
          </div>
          <div className="px-4 pb-3 space-y-1.5">
            {summary.activeTreatments.slice(0, 5).map((m: { id: string; medication_name: string; end_date: string | null; withdrawal_period_days: number | null; flocks: unknown }) => (
              <div key={m.id} className="flex justify-between text-sm">
                <span style={{ color: 'var(--ink)' }}>
                  {m.medication_name} — {(m.flocks as { flock_code: string })?.flock_code ?? '—'}
                </span>
                <span style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>
                  {m.end_date ? `ends ${formatDate(m.end_date)}` : 'ongoing'}
                  {m.withdrawal_period_days ? ` · ${m.withdrawal_period_days}d withdrawal` : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold" style={{ color: 'var(--ink)' }}>Medication History</h3>
          <span className="badge-gray">{records.length} records</span>
        </div>
        {records.length === 0 ? (
          <div className="text-center py-12">
            <Pill size={40} style={{ color: 'var(--line-strong)', margin: '0 auto 12px' }} />
            <p className="font-semibold" style={{ color: 'var(--ink-soft)' }}>No medication records yet</p>
            <p className="text-sm mt-1 mb-5" style={{ color: 'var(--ink-muted)' }}>
              Track antibiotics, vitamins, supplements, and treatment durations per flock.
            </p>
            <Link href="/medication/new" className="btn-primary inline-flex">
              <Plus size={16} /> Log First Medication
            </Link>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Flock</th>
                  <th>Medication</th>
                  <th>Purpose</th>
                  <th>Route</th>
                  <th>Birds</th>
                  <th>Withdrawal</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id}>
                    <td className="whitespace-nowrap">{formatDate(r.start_date)}</td>
                    <td style={{ color: 'var(--ink-muted)' }}>{r.end_date ? formatDate(r.end_date) : 'Ongoing'}</td>
                    <td style={{ color: 'var(--ink-soft)' }}>{(r.flocks as { flock_code: string })?.flock_code ?? '—'}</td>
                    <td className="font-semibold">{r.medication_name}</td>
                    <td style={{ color: 'var(--ink-soft)' }}>{r.purpose || '—'}</td>
                    <td>{r.route ? <span className="badge-gray">{routeLabel(r.route)}</span> : '—'}</td>
                    <td>{r.num_birds_treated?.toLocaleString() ?? '—'}</td>
                    <td style={{ color: 'var(--amber)' }}>
                      {r.withdrawal_period_days ? `${r.withdrawal_period_days} days` : '—'}
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <Link href={`/medication/${r.id}/edit`} className="text-xs font-medium flex items-center gap-1" style={{ color: 'var(--green)' }}>
                          <Pencil size={11} /> Edit
                        </Link>
                        <DeleteButton action={deleteMedicationRecord.bind(null, r.id)} label="medication record" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
