import { requireUser } from '@/lib/session'
import { Droplets, Plus } from 'lucide-react'

export const metadata = { title: 'Water Consumption | LayerPro' }

export default async function WaterPage() {
  await requireUser()
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title flex items-center gap-2">
          <Droplets size={24} className="text-farm-green-600" /> Water Consumption
        </h1>
        <button className="btn-primary"><Plus size={16} /> Log Water</button>
      </div>
      <div className="card text-center py-16">
        <div className="text-5xl mb-4">💧</div>
        <p className="font-semibold text-gray-700 mb-1">No water records yet</p>
        <p className="text-gray-400 text-sm">Track daily water consumption to monitor bird health and system performance.</p>
      </div>
    </div>
  )
}
