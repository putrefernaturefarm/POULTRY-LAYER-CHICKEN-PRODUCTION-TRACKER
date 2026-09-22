'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireUser, getCurrentFarm } from '@/lib/session'

export async function createWaterRecord(fd: FormData) {
  const user = await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) return { error: 'No active farm found.' }

  const flockId    = fd.get('flock_id') as string | null
  const recordDate = fd.get('record_date') as string
  if (!recordDate) return { error: 'Record date is required.' }

  const morning   = parseFloat(String(fd.get('morning_liters')   ?? '0')) || 0
  const afternoon = parseFloat(String(fd.get('afternoon_liters') ?? '0')) || 0
  const directTotal = parseFloat(String(fd.get('total_liters')   ?? ''))
  const total = morning + afternoon > 0 ? morning + afternoon : isNaN(directTotal) ? 0 : directTotal

  if (total <= 0) return { error: 'Total water consumption must be greater than 0.' }

  const hensPresent = parseInt(String(fd.get('hens_present') ?? ''))

  const supabase = await createClient()
  const { error } = await supabase.from('water_records').insert({
    farm_id:          farm.id,
    flock_id:         flockId || null,
    house_id:         fd.get('house_id') || null,
    record_date:      recordDate,
    morning_liters:   morning || null,
    afternoon_liters: afternoon || null,
    total_liters:     total,
    hens_present:     isNaN(hensPresent) ? null : hensPresent,
    water_source:     String(fd.get('water_source') ?? '') || null,
    notes:            String(fd.get('notes') ?? '') || null,
    created_by:       user.id,
  })

  if (error) return { error: error.message }
  revalidatePath('/water')
  redirect('/water')
}

export async function updateWaterRecord(recordId: string, fd: FormData) {
  const farm = await getCurrentFarm()
  if (!farm) return { error: 'No active farm found.' }

  const morning   = parseFloat(String(fd.get('morning_liters')   ?? '0')) || 0
  const afternoon = parseFloat(String(fd.get('afternoon_liters') ?? '0')) || 0
  const directTotal = parseFloat(String(fd.get('total_liters')   ?? ''))
  const total = morning + afternoon > 0 ? morning + afternoon : isNaN(directTotal) ? 0 : directTotal
  const hensPresent = parseInt(String(fd.get('hens_present') ?? ''))

  const supabase = await createClient()
  const { error } = await supabase
    .from('water_records')
    .update({
      flock_id:         fd.get('flock_id') || null,
      house_id:         fd.get('house_id') || null,
      record_date:      String(fd.get('record_date') ?? ''),
      morning_liters:   morning || null,
      afternoon_liters: afternoon || null,
      total_liters:     total,
      hens_present:     isNaN(hensPresent) ? null : hensPresent,
      water_source:     String(fd.get('water_source') ?? '') || null,
      notes:            String(fd.get('notes') ?? '') || null,
    })
    .eq('id', recordId)
    .eq('farm_id', farm.id)

  if (error) return { error: error.message }
  revalidatePath('/water')
  redirect('/water')
}

export async function deleteWaterRecord(recordId: string) {
  const farm = await getCurrentFarm()
  if (!farm) return { error: 'No active farm found.' }
  const supabase = await createClient()
  const { error } = await supabase
    .from('water_records')
    .delete()
    .eq('id', recordId)
    .eq('farm_id', farm.id)
  if (error) return { error: error.message }
  revalidatePath('/water')
}

export async function getWaterRecords(farmId: string, limit = 50) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('water_records')
    .select('*, flocks(flock_code), poultry_houses(name)')
    .eq('farm_id', farmId)
    .order('record_date', { ascending: false })
    .limit(limit)
  return data ?? []
}

export async function getWaterSummary(farmId: string) {
  const supabase = await createClient()
  const monthStart = new Date().toISOString().slice(0, 7) + '-01'

  const { data } = await supabase
    .from('water_records')
    .select('total_liters, hens_present')
    .eq('farm_id', farmId)
    .gte('record_date', monthStart)

  const records = data ?? []
  const totalLiters = records.reduce((s, r) => s + (r.total_liters || 0), 0)
  const daysWithHens = records.filter(r => (r.hens_present || 0) > 0)
  const avgPerBird = daysWithHens.length > 0
    ? daysWithHens.reduce((s, r) => s + (r.total_liters / (r.hens_present || 1)), 0) / daysWithHens.length
    : 0

  return { totalLiters, avgPerBird, recordCount: records.length }
}
