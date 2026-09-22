import { requireUser } from '@/lib/session'
import { UtensilsCrossed, Plus } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Feed Management | LayerPro' }

export default async function FeedPage() {
  await requireUser()
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title flex items-center gap-2">
          <UtensilsCrossed size={24} className="text-farm-green-600" /> Feed Management
        </h1>
        <Link href="/feed/new" className="btn-primary"><Plus size={16} /> Log Feed</Link>
      </div>
      <div className="card text-center py-16">
        <div className="text-5xl mb-4">🌾</div>
        <p className="font-semibold text-gray-700 mb-1">No feed records yet</p>
        <p className="text-gray-400 text-sm mb-6">Start logging daily feed consumption to track costs and intake per bird.</p>
        <Link href="/feed/new" className="btn-primary inline-flex"><Plus size={16} /> Log First Feed Record</Link>
      </div>
    </div>
  )
}
