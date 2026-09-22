import { requireUser, getCurrentFarm } from '@/lib/session'
import { redirect } from 'next/navigation'
import NewHouseForm from '@/components/houses/NewHouseForm'

export const metadata = { title: 'Add Poultry House | LayerPro' }

export default async function NewHousePage() {
  await requireUser()
  const farm = await getCurrentFarm()

  if (!farm) redirect('/farms?setup=house')

  return (
    <div className="p-4 md:p-6 max-w-xl mx-auto">
      <h1 className="page-title mb-1">Add Poultry House</h1>
      <p className="text-sm text-gray-400 mb-6">Farm: {farm.name}</p>
      <NewHouseForm farmId={farm.id} />
    </div>
  )
}
