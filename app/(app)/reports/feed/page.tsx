import { requireUser, getCurrentFarm } from '@/lib/session'
import { formatDate, formatNumber } from '@/lib/utils'
import { UtensilsCrossed } from 'lucide-react'
import DownloadCSVButton from '@/components/reports/DownloadCSVButton'

export const metadata = { title: 'Feed Report | LayerPro' }

export default async function FeedReportPage() {
  await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) return <div className="p-6"><p className="text-gray-500">No farm found.</p></div>

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <UtensilsCrossed size={24} className="text-farm-green-600" /> Feed Report
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{farm.name}</p>
        </div>
        <DownloadCSVButton data={[]} filename="feed-report" label="Download CSV" />
      </div>

      <div className="card text-center py-16">
        <div className="text-5xl mb-4">🌾</div>
        <p className="font-semibold text-gray-700 mb-1">No feed records yet</p>
        <p className="text-gray-400 text-sm">Start logging daily feed consumption in the Feed section to generate this report.</p>
      </div>
    </div>
  )
}
