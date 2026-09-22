import { ClipboardList, Egg, AlertTriangle, Skull, UtensilsCrossed, DollarSign, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

const reportGroups = [
  {
    title: 'Production',
    reports: [
      { href: '/reports/production', icon: Egg, label: 'Daily Production Report', desc: 'Egg collection, HDP%, and quality by date/flock.' },
    ],
  },
  {
    title: 'Health',
    reports: [
      { href: '/reports/morbidity', icon: AlertTriangle, label: 'Morbidity Report', desc: 'Affected birds, morbidity rates, top conditions, trends.' },
      { href: '/reports/mortality', icon: Skull, label: 'Mortality Report', desc: 'Deaths, mortality rates, causes, and cumulative totals.' },
      { href: '/reports/health', icon: ClipboardList, label: 'Health Summary', desc: 'Combined health event overview.' },
    ],
  },
  {
    title: 'Feed',
    reports: [
      { href: '/reports/feed', icon: UtensilsCrossed, label: 'Feed Report', desc: 'Daily consumption, feed per hen, and feed costs.' },
    ],
  },
  {
    title: 'Financial',
    reports: [
      { href: '/reports/financial', icon: DollarSign, label: 'Financial Report', desc: 'Revenue, expenses, gross margin, and cost per egg.' },
    ],
  },
]

export default function ReportsPage() {
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="page-title flex items-center gap-2"><ClipboardList size={24} /> Reports</h1>
        <p className="text-sm text-gray-500 mt-0.5">Farm performance reports and summaries</p>
      </div>

      {reportGroups.map(group => (
        <div key={group.title}>
          <p className="section-title mb-3">{group.title}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {group.reports.map(({ href, icon: Icon, label, desc }) => (
              <Link key={href} href={href} className="card flex items-start gap-4 hover:shadow-float transition-all">
                <div className="w-10 h-10 rounded-xl bg-farm-green-50 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-farm-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{label}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
