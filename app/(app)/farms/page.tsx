import { requireUser } from '@/lib/session'
import { getFarms } from '@/app/actions/farms'
import { Home, Plus, MapPin } from 'lucide-react'
import Link from 'next/link'

export default async function FarmsPage() {
  await requireUser()
  const farms = await getFarms()

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title flex items-center gap-2"><Home size={24} className="text-farm-green-600" /> Farm Profile</h1>
        <Link href="/farms/new" className="btn-primary"><Plus size={16} /> Add Farm</Link>
      </div>

      {farms.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-4">🏡</div>
          <p className="font-medium text-gray-700 mb-1">No farm created yet</p>
          <p className="text-gray-400 text-sm mb-6">Create your farm profile to start tracking production.</p>
          <Link href="/farms/new" className="btn-primary inline-flex"><Plus size={16} /> Create Farm</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {farms.map(farm => (
            <div key={farm.id} className="card flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-farm-green-100 flex items-center justify-center text-2xl shrink-0">🐔</div>
              <div className="flex-1">
                <h2 className="font-bold text-gray-900 text-lg">{farm.name}</h2>
                {(farm.municipality || farm.province) && (
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                    <MapPin size={12} /> {[farm.municipality, farm.province].filter(Boolean).join(', ')}
                  </p>
                )}
                {farm.contact_person && <p className="text-sm text-gray-500 mt-0.5">Contact: {farm.contact_person}</p>}
              </div>
              <Link href={`/farms/${farm.id}/edit`} className="btn-ghost text-xs">Edit</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
