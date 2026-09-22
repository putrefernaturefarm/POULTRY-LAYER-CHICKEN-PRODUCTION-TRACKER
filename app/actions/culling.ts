'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireUser, getCurrentFarm } from '@/lib/session'

export async function createCullingRecord(fd: FormData) {
  const user = await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) return { error: 'No active farm found.' }

  const cullingDate = fd.get('culling_date') as string
  const numCulled   = parseInt(String(fd.get('num_culled') ?? '0'))

  if (!cullingDate)   return { error: 'Culling date is required.' }
  if (numCulled <= 0) return { error: 'Number of birds culled must be greater than 0.' }

  const revenue = parseFloat(String(fd.get('revenue') ?? ''))

  const supabase = await createClient()
  const { error } = await supabase.from('culling_records').insert({
    farm_id:         farm.id,
    flock_id:        fd.get('flock_id') || null,
    house_id:        fd.get('house_id') || null,
    culling_date:    cullingDate,
    num_culled:      numCulled,
    reason:          fd.get('reason') || null,
    disposal_method: fd.get('disposal_method') || null,
    revenue:         isNaN(revenue) ? null : revenue,
    notes:           String(fd.get('notes') ?? '') || null,
    created_by:      user.id,
  })

  if (error) return { error: error.message }
  revalidatePath('/culling')
  redirect('/culling')
}

export async function updateCullingRecord(recordId: string, fd: FormData) {
  const farm = await getCurrentFarm()
  if (!farm) return { error: 'No active farm found.' }
  const revenue = parseFloat(String(fd.get('revenue') ?? ''))
  const supabase = await createClient()
  const { error } = await supabase
    .from('culling_records')
    .update({
      flock_id:        fd.get('flock_id') || null,
      house_id:        fd.get('house_id') || null,
      culling_date:    String(fd.get('culling_date') ?? ''),
      num_culled:      parseInt(String(fd.get('num_culled') ?? '0')),
      reason:          fd.get('reason') || null,
      disposal_method: fd.get('disposal_method') || null,
      revenue:         isNaN(revenue) ? null : revenue,
      notes:           String(fd.get('notes') ?? '') || null,
    })
    .eq('id', recordId)
    .eq('farm_id', farm.id)
  if (error) return { error: error.message }
  revalidatePath('/culling')
  redirect('/culling')
}

export async function deleteCullingRecord(recordId: string) {
  const farm = await getCurrentFarm()
  if (!farm) return { error: 'No active farm found.' }
  const supabase = await createClient()
  const { error } = await supabase
    .from('culling_records')
    .delete()
    .eq('id', recordId)
    .eq('farm_id', farm.id)
  if (error) return { error: error.message }
  revalidatePath('/culling')
}

export async function getCullingRecords(farmId: string, limit = 50) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('culling_records')
    .select('*, flocks(flock_code), poultry_houses(name)')
    .eq('farm_id', farmId)
    .order('culling_date', { ascending: false })
    .limit(limit)
  return data ?? []
}

export async function getCullingSummary(farmId: string) {
  const supabase = await createClient()
  const monthStart = new Date().toISOString().slice(0, 7) + '-01'
  const { data } = await supabase
    .from('culling_records')
    .select('num_culled, reason, revenue')
    .eq('farm_id', farmId)
    .gte('culling_date', monthStart)

  const records = data ?? []
  const totalCulled  = records.reduce((s, r) => s + (r.num_culled || 0), 0)
  const totalRevenue = records.reduce((s, r) => s + (r.revenue || 0), 0)
  const byReason     = records.reduce((acc: Record<string, number>, r) => {
    const k = r.reason || 'other'
    acc[k] = (acc[k] || 0) + (r.num_culled || 0)
    return acc
  }, {})

  return { totalCulled, totalRevenue, byReason }
}
