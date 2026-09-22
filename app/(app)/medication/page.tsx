import { requireUser } from '@/lib/session'
import { Pill, Plus } from 'lucide-react'

export const metadata = { title: 'Medication | LayerPro' }

export default async function MedicationPage() {
  await requireUser()
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title flex items-center gap-2">
          <Pill size={24} className="text-farm-green-600" /> Medication Records
        </h1>
        <button className="btn-primary"><Plus size={16} /> Log Medication</button>
      </div>
      <div className="card text-center py-16">
        <div className="text-5xl mb-4">💊</div>
        <p className="font-semibold text-gray-700 mb-1">No medication records yet</p>
        <p className="text-gray-400 text-sm">Track antibiotics, vitamins, supplements, and treatment durations per flock.</p>
      </div>
    </div>
  )
}
