import { requireUser } from '@/lib/session'
import { Package, Plus } from 'lucide-react'

export const metadata = { title: 'Inventory | LayerPro' }

export default async function InventoryPage() {
  await requireUser()
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title flex items-center gap-2">
          <Package size={24} className="text-farm-green-600" /> Inventory
        </h1>
        <button className="btn-primary"><Plus size={16} /> Add Item</button>
      </div>
      <div className="card text-center py-16">
        <div className="text-5xl mb-4">📦</div>
        <p className="font-semibold text-gray-700 mb-1">No inventory items yet</p>
        <p className="text-gray-400 text-sm">Track feeds, medicines, vaccines, and supplies with stock levels and reorder alerts.</p>
      </div>
    </div>
  )
}
