import { requireUser, getCurrentFarm } from '@/lib/session'
import { getVaccinationRecords, getVaccinationSummary, deleteVaccinationRecord } from '@/app/actions/vaccination'
import { formatDate } from '@/lib/utils'
import { Syringe, Plus, Pencil, CalendarClock } from 'lucide-react'
import Link from 'next/link'
import { VACCINATION_ROUTES } from '@/lib/constants'
import DeleteButton from '@/components/shared/DeleteButton'

export const metadata = { title: 'Vaccination | LayerPro' }

export default async function VaccinationPage() {
  await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) return <div className="p-6"><p style={{ color: 'var(--ink-soft)' }}>No farm found.</p></div>

  const [records, summary] = await Promise.all([
    getVaccinationRecords(farm.id),
    getVaccinationSummary(farm.id),
  ])

  const routeLabel = (v: string) => VACCINATION_ROUTES.find(r => r.value === v)?.label ?? v

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Syringe size={22} style={{ color: 'var(--green)' }} /> Vaccination Records
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--ink-soft)' }}>{farm.name}</p>
        </div>
        <Link href="/vaccination/new" className="btn-primary"><Plus size={16} /> Log Vaccination</Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="stat-card" style={{ borderLeft: '4px solid var(--green)' }}>
          <span className="stat-label">This Month</span>
          <span className="stat-value" style={{ color: 'var(--green)' }}>{summary.monthCount}</span>
          <span className="stat-sub">vaccinations logged</span>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--amber)' }}>
          <span className="stat-label">Due in 30 Days</span>
          <span className="stat-value" style={{ color: 'var(--amber)' }}>{summary.upcomingDue.length}</span>
          <span className="stat-sub">upcoming boosters</span>
        </div>
      </div>

      {summary.upcomingDue.length > 0 && (
        <div className="card" style={{ border: '1px solid var(--amber)', background: 'var(--paper-2)' }}>
          <div className="card-header">
            <h3 className="font-semibold flex items-center gap-1.5 text-sm" style={{ color: 'var(--amber)' }}>
              <CalendarClock size={14} /> Upcoming Vaccinations
            </h3>
          </div>
          <div className="px-4 pb-3 space-y-1.5">
            {summary.upcomingDue.map((v: { id: string; vaccine_name: string; next_due_date: string; flocks: unknown }) => (
              <div key={v.id} className="flex justify-between text-sm">
                <span style={{ color: 'var(--ink)' }}>{v.vaccine_name} — {(v.flocks as { flock_code: string })?.flock_code ?? '—'}</span>
                <span style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>{formatDate(v.next_due_date)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold" style={{ color: 'var(--ink)' }}>Vaccination History</h3>
          <span className="badge-gray">{records.length} records</span>
        </div>
        {records.length === 0 ? (
          <div className="text-center py-12">
            <Syringe size={40} style={{ color: 'var(--line-strong)', margin: '0 auto 12px' }} />
            <p className="font-semibold" style={{ color: 'var(--ink-soft)' }}>No vaccination records yet</p>
            <p className="text-sm mt-1 mb-5" style={{ color: 'var(--ink-muted)' }}>
              Track vaccination schedules, vaccine types, and dosage per flock.
            </p>
            <Link href="/vaccination/new" className="btn-primary inline-flex">
              <Plus size={16} /> Log First Vaccination
            </Link>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Flock</th>
                  <th>Vaccine</th>
                  <th>Disease Target</th>
                  <th>Route</th>
                  <th>Birds</th>
                  <th>Next Due</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id}>
                    <td className="whitespace-nowrap">{formatDate(r.vaccination_date)}</td>
                    <td style={{ color: 'var(--ink-soft)' }}>{(r.flocks as { flock_code: string })?.flock_code ?? '—'}</td>
                    <td className="font-semibold">{r.vaccine_name}</td>
                    <td style={{ color: 'var(--ink-soft)' }}>{r.disease_target || '—'}</td>
                    <td>{r.route ? <span className="badge-gray">{routeLabel(r.route)}</span> : '—'}</td>
                    <td>{r.num_birds_vaccinated?.toLocaleString() ?? '—'}</td>
                    <td style={{ color: r.next_due_date ? 'var(--amber)' : 'var(--ink-muted)' }}>
                      {r.next_due_date ? formatDate(r.next_due_date) : '—'}
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <Link href={`/vaccination/${r.id}/edit`} className="text-xs font-medium flex items-center gap-1" style={{ color: 'var(--green)' }}>
                          <Pencil size={11} /> Edit
                        </Link>
                        <DeleteButton action={deleteVaccinationRecord.bind(null, r.id)} label="vaccination record" />
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
