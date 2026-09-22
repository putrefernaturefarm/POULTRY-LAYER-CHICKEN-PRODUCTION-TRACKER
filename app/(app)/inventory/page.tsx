import { requireUser, getCurrentFarm } from '@/lib/session'
import { createClient } from '@/lib/supabase/server'
import { Package, UtensilsCrossed, Syringe, Pill, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

export const metadata = { title: 'Inventory | LayerPro' }

export default async function InventoryPage() {
  await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) return <div className="p-6"><p style={{ color: 'var(--ink-soft)' }}>No farm found.</p></div>

  const supabase = await createClient()
  const monthStart = new Date().toISOString().slice(0, 7) + '-01'

  const [{ data: feedData }, { data: vacData }, { data: medData }] = await Promise.all([
    supabase.from('feed_records').select('quantity_kg, total_cost').eq('farm_id', farm.id).gte('record_date', monthStart),
    supabase.from('vaccination_records').select('id, vaccine_name, num_birds_vaccinated').eq('farm_id', farm.id).gte('vaccination_date', monthStart),
    supabase.from('medication_records').select('id, medication_name').eq('farm_id', farm.id).gte('start_date', monthStart),
  ])

  const totalFeedKg   = (feedData ?? []).reduce((s, r) => s + (r.quantity_kg || 0), 0)
  const totalFeedCost = (feedData ?? []).reduce((s, r) => s + (r.total_cost  || 0), 0)
  const vacCount      = (vacData  ?? []).length
  const medCount      = (medData  ?? []).length

  const modules = [
    {
      href: '/feed',
      icon: UtensilsCrossed,
      label: 'Feed',
      iconColor: 'var(--amber)',
      stats: [
        { label: 'Consumed (month)', value: `${totalFeedKg.toFixed(0)} kg` },
        { label: 'Feed Cost',        value: formatCurrency(totalFeedCost) },
      ],
    },
    {
      href: '/vaccination',
      icon: Syringe,
      label: 'Vaccines',
      iconColor: 'var(--green)',
      stats: [
        { label: 'This Month', value: `${vacCount} vaccinations` },
      ],
    },
    {
      href: '/medication',
      icon: Pill,
      label: 'Medicines',
      iconColor: '#9b59b6',
      stats: [
        { label: 'This Month', value: `${medCount} treatments` },
      ],
    },
  ]

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Package size={22} style={{ color: 'var(--ink-soft)' }} /> Inventory Overview
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--ink-soft)' }}>
            Consumption summary — {farm.name}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {modules.map(({ href, icon: Icon, label, iconColor, stats }) => (
          <Link
            key={href}
            href={href}
            className="card block group transition-opacity hover:opacity-90"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Icon size={18} style={{ color: iconColor }} />
                <span className="font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink)' }}>
                  {label}
                </span>
              </div>
              <ArrowRight size={14} style={{ color: 'var(--ink-muted)' }} className="group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="space-y-2">
              {stats.map(s => (
                <div key={s.label} className="flex justify-between text-sm">
                  <span style={{ color: 'var(--ink-muted)' }}>{s.label}</span>
                  <span className="font-semibold" style={{ color: 'var(--ink)', fontFamily: 'var(--font-mono)' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </Link>
        ))}
      </div>

      <div
        className="rounded-xl p-5 text-center"
        style={{ background: 'var(--paper-2)', border: '1px dashed var(--line-strong)' }}
      >
        <Package size={32} style={{ color: 'var(--line-strong)', margin: '0 auto 10px' }} />
        <p className="font-semibold text-sm" style={{ color: 'var(--ink-soft)' }}>
          Dedicated stock tracking coming soon
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--ink-muted)' }}>
          Reorder alerts, stock levels, and supplier management will be available here.
        </p>
      </div>
    </div>
  )
}
