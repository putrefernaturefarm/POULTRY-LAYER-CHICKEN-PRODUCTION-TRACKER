import { createClient } from '@/lib/supabase/server'
import { AlertTriangle, Bell, CheckCircle } from 'lucide-react'
import { cn, timeAgo } from '@/lib/utils'

export default async function AlertsPanel({ farmId }: { farmId: string }) {
  const supabase = await createClient()
  const { data: alerts } = await supabase
    .from('alerts')
    .select('*')
    .eq('farm_id', farmId)
    .eq('is_resolved', false)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="card h-full">
      <div className="card-header">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Bell size={16} /> Alerts
        </h3>
        {(alerts?.length ?? 0) > 0 && (
          <span className="badge-red">{alerts?.length}</span>
        )}
      </div>

      {!alerts || alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <CheckCircle size={32} className="text-green-400 mb-2" />
          <p className="text-sm text-gray-500">No active alerts</p>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                'rounded-xl p-3 border text-sm',
                alert.severity === 'critical' ? 'border-red-200 bg-red-50' :
                alert.severity === 'warning'  ? 'border-amber-200 bg-amber-50' :
                'border-blue-200 bg-blue-50'
              )}
            >
              <div className="flex items-start gap-2">
                <AlertTriangle
                  size={14}
                  className={cn(
                    'mt-0.5 shrink-0',
                    alert.severity === 'critical' ? 'text-red-600' :
                    alert.severity === 'warning'  ? 'text-amber-600' :
                    'text-blue-600'
                  )}
                />
                <div>
                  <p className="font-medium text-gray-900">{alert.title}</p>
                  {alert.message && <p className="text-gray-600 text-xs mt-0.5">{alert.message}</p>}
                  <p className="text-gray-400 text-xs mt-1">{timeAgo(alert.created_at)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
