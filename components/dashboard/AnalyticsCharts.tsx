'use client'

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface ProdRow { date: string; eggs: number; hdp: number }
interface MorbRow { date: string; affected: number; rate: number }
interface MortRow { date: string; deaths: number; rate: number }

export default function AnalyticsCharts({
  production, morbidity, mortality
}: { production: ProdRow[]; morbidity: MorbRow[]; mortality: MortRow[] }) {
  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Egg Production — 60 Days</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={production} margin={{ left: -20, right: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="eggs" fill="#eab308" radius={[3,3,0,0]} name="Eggs" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Hen-Day Production % — 60 Days</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={production} margin={{ left: -20, right: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => `${v}%`} />
            <Line type="monotone" dataKey="hdp" stroke="#16a34a" strokeWidth={2} dot={false} name="HDP %" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-1">Morbidity vs. Mortality — 60 Days</h3>
        <p className="text-xs text-gray-400 mb-4">Morbidity = sick birds (not deaths). Mortality = deaths. Tracked separately.</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart margin={{ left: -20, right: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" type="category" allowDuplicatedCategory={false} tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Line data={morbidity} type="monotone" dataKey="affected" stroke="#f59e0b" strokeWidth={2} dot={false} name="Morbidity (affected)" />
            <Line data={mortality} type="monotone" dataKey="deaths" stroke="#ef4444" strokeWidth={2} dot={false} name="Mortality (deaths)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
