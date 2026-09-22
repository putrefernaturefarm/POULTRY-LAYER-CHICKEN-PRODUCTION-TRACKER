import { requireUser, getCurrentFarm } from '@/lib/session'
import { createClient } from '@/lib/supabase/server'
import { getProductionSummary } from '@/app/actions/production'
import { getMorbiditySummary } from '@/app/actions/morbidity'
import { getMortalitySummary } from '@/app/actions/mortality'
import { getExpenseSummary } from '@/app/actions/expenses'
import { getSalesSummary } from '@/app/actions/sales'
import { formatNumber, formatCurrency, formatPct } from '@/lib/utils'
import {
  Egg, Bird, AlertTriangle, Skull, UtensilsCrossed,
  TrendingUp, TrendingDown, DollarSign, ShoppingBag,
  Activity, Plus, Zap
} from 'lucide-react'
import Link from 'next/link'
import DashboardCharts from '@/components/dashboard/DashboardCharts'
import AlertsPanel from '@/components/dashboard/AlertsPanel'

export default async function DashboardPage() {
  const user = await requireUser()
  const farm = await getCurrentFarm()

  if (!farm) {
    return (
      <div className="p-6 max-w-md mx-auto mt-10">
        <div className="card text-center py-10">
          <div className="text-5xl mb-4">🏡</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome to LayerPro</h2>
          <p className="text-gray-500 text-sm mb-6">
            Start by creating your farm profile to begin tracking your layer chicken production.
          </p>
          <Link href="/farms/new" className="btn-primary">
            <Plus size={16} /> Create Farm
          </Link>
        </div>
      </div>
    )
  }

  const [production, morbidity, mortality, expenses, sales] = await Promise.all([
    getProductionSummary(farm.id),
    getMorbiditySummary(farm.id),
    getMortalitySummary(farm.id),
    getExpenseSummary(farm.id),
    getSalesSummary(farm.id),
  ])

  // Load active flocks count
  const supabase = await createClient()
  const { count: activeFlocks } = await supabase
    .from('flocks').select('id', { count: 'exact', head: true })
    .eq('farm_id', farm.id).eq('status', 'active')

  const { count: totalBirds } = await supabase
    .from('flock_population').select('ending_pop', { count: 'exact', head: true })
    .eq('farm_id', farm.id)

  // Get recent 14-day production for chart
  const { data: chartData } = await supabase
    .from('daily_production')
    .select('record_date, total_eggs, hen_day_pct, hens_present')
    .eq('farm_id', farm.id)
    .order('record_date', { ascending: false })
    .limit(14)

  const grossMargin = sales.total - expenses.total

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">{farm.name}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Production Dashboard</p>
        </div>
        <Link href="/quick-entry" className="btn-primary">
          <Zap size={16} /> Quick Entry
        </Link>
      </div>

      {/* Health Alerts Banner */}
      {(morbidity.activeCaseCount > 0 || mortality.monthlyDeaths > 0) && (
        <div className="alert-warning flex items-center gap-2">
          <AlertTriangle size={16} className="shrink-0" />
          <span>
            {morbidity.activeCaseCount > 0 && `${morbidity.activeCaseCount} active morbidity case(s) — ${morbidity.totalAffected} birds affected. `}
            {mortality.monthlyDeaths > 0 && `${mortality.monthlyDeaths} deaths recorded this month.`}
          </span>
        </div>
      )}

      {/* KPI Row 1 — Production */}
      <div>
        <p className="section-title mb-3">Production Today</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            icon={<Egg size={20} className="text-amber-500" />}
            label="Eggs Today"
            value={formatNumber(production.todayEggs)}
            sub="total eggs collected"
            color="amber"
          />
          <StatCard
            icon={<TrendingUp size={20} className="text-green-600" />}
            label="Hen-Day Production"
            value={formatPct(production.avgHdp)}
            sub="laying rate today"
            color="green"
          />
          <StatCard
            icon={<Egg size={20} className="text-blue-500" />}
            label="Eggs This Month"
            value={formatNumber(production.monthEggs)}
            sub="total this month"
            color="blue"
          />
          <StatCard
            icon={<Bird size={20} className="text-purple-500" />}
            label="Active Flocks"
            value={String(activeFlocks ?? 0)}
            sub="flocks in production"
            color="purple"
          />
        </div>
      </div>

      {/* KPI Row 2 — Health */}
      <div>
        <p className="section-title mb-3">Health Status</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            icon={<AlertTriangle size={20} className="text-amber-500" />}
            label="Morbidity Rate"
            value={formatPct(morbidity.avgMorbRate)}
            sub={`${morbidity.totalAffected} birds affected`}
            color="amber"
            href="/morbidity"
          />
          <StatCard
            icon={<Activity size={20} className="text-blue-500" />}
            label="Active Cases"
            value={String(morbidity.activeCaseCount)}
            sub="unresolved health events"
            color="blue"
            href="/morbidity"
          />
          <StatCard
            icon={<Skull size={20} className="text-red-500" />}
            label="Monthly Deaths"
            value={String(mortality.monthlyDeaths)}
            sub="this month"
            color={mortality.monthlyDeaths > 0 ? 'red' : 'gray'}
            href="/mortality"
          />
          <StatCard
            icon={<UtensilsCrossed size={20} className="text-orange-500" />}
            label="Under Treatment"
            value={String(morbidity.totalUnderTreatment)}
            sub="birds on medication"
            color="orange"
          />
        </div>
      </div>

      {/* KPI Row 3 — Finance */}
      <div>
        <p className="section-title mb-3">Financial (This Month)</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            icon={<ShoppingBag size={20} className="text-green-600" />}
            label="Revenue"
            value={formatCurrency(sales.total)}
            sub="total sales"
            color="green"
            href="/sales"
          />
          <StatCard
            icon={<DollarSign size={20} className="text-red-500" />}
            label="Expenses"
            value={formatCurrency(expenses.total)}
            sub="total costs"
            color="red"
            href="/expenses"
          />
          <StatCard
            icon={grossMargin >= 0
              ? <TrendingUp size={20} className="text-green-600" />
              : <TrendingDown size={20} className="text-red-500" />}
            label="Gross Margin"
            value={formatCurrency(grossMargin)}
            sub={grossMargin >= 0 ? 'profitable' : 'loss'}
            color={grossMargin >= 0 ? 'green' : 'red'}
          />
          <StatCard
            icon={<Egg size={20} className="text-amber-500" />}
            label="Egg Sales"
            value={formatCurrency(sales.eggSales)}
            sub={`${formatNumber(sales.eggQty)} eggs sold`}
            color="amber"
          />
        </div>
      </div>

      {/* Chart + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DashboardCharts data={(chartData ?? []).reverse()} />
        </div>
        <div>
          <AlertsPanel farmId={farm.id} />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <p className="section-title mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: '/production/new', label: 'Record Eggs',    emoji: '🥚' },
            { href: '/morbidity/new',  label: 'Log Morbidity',  emoji: '🏥' },
            { href: '/mortality/new',  label: 'Log Mortality',  emoji: '💀' },
            { href: '/feed/new',       label: 'Log Feed',       emoji: '🌾' },
            { href: '/expenses/new',   label: 'Add Expense',    emoji: '💰' },
            { href: '/sales/new',      label: 'Record Sale',    emoji: '📦' },
            { href: '/vaccination/new',label: 'Log Vaccination',emoji: '💉' },
            { href: '/reports',        label: 'View Reports',   emoji: '📊' },
          ].map(({ href, label, emoji }) => (
            <Link
              key={href}
              href={href}
              className="card flex flex-col items-center justify-center gap-2 py-5 hover:shadow-float transition-all text-center"
            >
              <span className="text-2xl">{emoji}</span>
              <span className="text-sm font-medium text-gray-700">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon, label, value, sub, color, href
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  color: string
  href?: string
}) {
  const content = (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-2">
        <span className="stat-label">{label}</span>
        {icon}
      </div>
      <span className="stat-value">{value}</span>
      <span className="stat-sub">{sub}</span>
    </div>
  )
  if (href) return <Link href={href} className="block hover:opacity-90 transition-opacity">{content}</Link>
  return content
}
