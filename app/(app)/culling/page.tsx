import { requireUser } from '@/lib/session'
import { Scissors, Plus } from 'lucide-react'

export const metadata = { title: 'Culling | LayerPro' }

export default async function CullingPage() {
  await requireUser()
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title flex items-center gap-2">
          <Scissors size={24} className="text-farm-green-600" /> Culling Records
        </h1>
        <button className="btn-primary"><Plus size={16} /> Log Culling</button>
      </div>
      <div className="card text-center py-16">
        <div className="text-5xl mb-4">✂️</div>
        <p className="font-semibold text-gray-700 mb-1">No culling records yet</p>
        <p className="text-gray-400 text-sm">Record birds removed from the flock due to poor performance, injury, or disease.</p>
      </div>
    </div>
  )
}
