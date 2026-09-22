import { requireUser } from '@/lib/session'
import { Heart, Plus } from 'lucide-react'

export const metadata = { title: 'Health Events | LayerPro' }

export default async function HealthPage() {
  await requireUser()
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title flex items-center gap-2">
          <Heart size={24} className="text-farm-green-600" /> Health Events
        </h1>
        <button className="btn-primary"><Plus size={16} /> Log Event</button>
      </div>
      <div className="card text-center py-16">
        <div className="text-5xl mb-4">🏥</div>
        <p className="font-semibold text-gray-700 mb-1">No health events recorded</p>
        <p className="text-gray-400 text-sm">Log disease outbreaks, symptoms, and veterinary visits here.</p>
      </div>
    </div>
  )
}
