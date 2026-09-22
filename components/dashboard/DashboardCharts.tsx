'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts'
import { formatDate } from '@/lib/utils'

interface ProductionRow {
  record_date: string
  total_eggs: number
  hen_day_pct: number
  hens_present: number
}

export default function DashboardCharts({ data }: { data: ProductionRow[] }) {
  const chartData = data.map((d) => ({
    date:    formatDate(d.record_date, 'MMM d'),
    eggs:    d.total_eggs,
    hdp:     Number((d.hen_day_pct || 0).toFixed(1)),
    hens:    d.hens_present,
  }))

  if (chartData.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center py-12 text-center">
        <span className="text-4xl mb-3">🥚</span>
        <p className="font-medium text-gray-700">No production data yet</p>
        <p className="text-sm text-gray-400 mt-1">Start recording daily egg production to see trends.</p>
      </div>
    )
  }

  return (
    <div className="card space-y-6">
      <div>
        <div className="card-header">
          <h3 className="font-semibold text-gray-900">Egg Production (Last 14 Days)</h3>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="eggs" fill="#eab308" radius={[4, 4, 0, 0]} name="Total Eggs" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <div className="card-header">
          <h3 className="font-semibold text-gray-900">Hen-Day Production % (Last 14 Days)</h3>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => `${v}%`} />
            <Line type="monotone" dataKey="hdp" stroke="#16a34a" strokeWidth={2} dot={false} name="HDP %" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
