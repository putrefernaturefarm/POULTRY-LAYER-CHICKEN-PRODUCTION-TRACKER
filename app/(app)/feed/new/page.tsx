import { requireUser } from '@/lib/session'
import { UtensilsCrossed } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Log Feed | LayerPro' }

export default async function NewFeedPage() {
  await requireUser()
  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <h1 className="page-title flex items-center gap-2 mb-6">
        <UtensilsCrossed size={24} className="text-farm-green-600" /> Log Feed Consumption
      </h1>
      <div className="card text-center py-16">
        <div className="text-5xl mb-4">🌾</div>
        <p className="font-semibold text-gray-700 mb-1">Feed logging form coming soon</p>
        <p className="text-gray-400 text-sm mb-6">This module is under development.</p>
        <Link href="/feed" className="btn-ghost">Back to Feed</Link>
      </div>
    </div>
  )
}
