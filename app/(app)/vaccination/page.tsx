import { requireUser } from '@/lib/session'
import { Syringe, Plus } from 'lucide-react'

export const metadata = { title: 'Vaccination | LayerPro' }

export default async function VaccinationPage() {
  await requireUser()
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title flex items-center gap-2">
          <Syringe size={24} className="text-farm-green-600" /> Vaccination Records
        </h1>
        <button className="btn-primary"><Plus size={16} /> Log Vaccination</button>
      </div>
      <div className="card text-center py-16">
        <div className="text-5xl mb-4">💉</div>
        <p className="font-semibold text-gray-700 mb-1">No vaccination records yet</p>
        <p className="text-gray-400 text-sm">Track vaccination schedules, vaccine types, and dosage per flock.</p>
      </div>
    </div>
  )
}
