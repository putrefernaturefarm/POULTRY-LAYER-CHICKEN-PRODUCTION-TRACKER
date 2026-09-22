'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts'

interface Row { date: string; affected: number; rate: number }

export default function MorbidityChart({ data }: { data: Row[] }) {
  if (data.length === 0) return null

  return (
    <div className="card space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Affected Birds — 30-Day Trend</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ left: -20, right: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="affected" fill="#f59e0b" radius={[4,4,0,0]} name="Affected Birds" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Morbidity Rate % — Trend</h3>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={data} margin={{ left: -20, right: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => `${v}%`} />
            <Line type="monotone" dataKey="rate" stroke="#f59e0b" strokeWidth={2} dot={false} name="Morbidity %" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
