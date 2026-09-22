'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireUser, getCurrentFarm } from '@/lib/session'

export async function createDebeakingRecord(fd: FormData) {
  const user = await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) return { error: 'No active farm found.' }

  const debeakingDate = fd.get('debeaking_date') as string
  const numBirds      = parseInt(String(fd.get('num_birds') ?? '0'))

  if (!debeakingDate)   return { error: 'Debeaking date is required.' }
  if (numBirds <= 0)    return { error: 'Number of birds must be greater than 0.' }

  const ageWeeks = parseInt(String(fd.get('age_weeks') ?? ''))

  const supabase = await createClient()
  const { error } = await supabase.from('debeaking_records').insert({
    farm_id:        farm.id,
    flock_id:       fd.get('flock_id') || null,
    house_id:       fd.get('house_id') || null,
    debeaking_date: debeakingDate,
    num_birds:      numBirds,
    age_weeks:      isNaN(ageWeeks) ? null : ageWeeks,
    method:         fd.get('method') || null,
    administered_by: String(fd.get('administered_by') ?? '') || null,
    notes:          String(fd.get('notes') ?? '') || null,
    created_by:     user.id,
  })

  if (error) return { error: error.message }
  revalidatePath('/debeaking')
  redirect('/debeaking')
}

export async function updateDebeakingRecord(recordId: string, fd: FormData) {
  const farm = await getCurrentFarm()
  if (!farm) return { error: 'No active farm found.' }

  const ageWeeks = parseInt(String(fd.get('age_weeks') ?? ''))

  const supabase = await createClient()
  const { error } = await supabase
    .from('debeaking_records')
    .update({
      flock_id:        fd.get('flock_id') || null,
      house_id:        fd.get('house_id') || null,
      debeaking_date:  String(fd.get('debeaking_date') ?? ''),
      num_birds:       parseInt(String(fd.get('num_birds') ?? '0')),
      age_weeks:       isNaN(ageWeeks) ? null : ageWeeks,
      method:          fd.get('method') || null,
      administered_by: String(fd.get('administered_by') ?? '') || null,
      notes:           String(fd.get('notes') ?? '') || null,
    })
    .eq('id', recordId)
    .eq('farm_id', farm.id)

  if (error) return { error: error.message }
  revalidatePath('/debeaking')
  redirect('/debeaking')
}

export async function deleteDebeakingRecord(recordId: string) {
  const farm = await getCurrentFarm()
  if (!farm) return { error: 'No active farm found.' }
  const supabase = await createClient()
  const { error } = await supabase
    .from('debeaking_records')
    .delete()
    .eq('id', recordId)
    .eq('farm_id', farm.id)
  if (error) return { error: error.message }
  revalidatePath('/debeaking')
}

export async function getDebeakingRecords(farmId: string, limit = 50) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('debeaking_records')
    .select('*, flocks(flock_code), poultry_houses(name)')
    .eq('farm_id', farmId)
    .order('debeaking_date', { ascending: false })
    .limit(limit)
  return data ?? []
}

export async function getDebeakingSummary(farmId: string) {
  const supabase = await createClient()
  const monthStart = new Date().toISOString().slice(0, 7) + '-01'
  const { data } = await supabase
    .from('debeaking_records')
    .select('num_birds, method')
    .eq('farm_id', farmId)
    .gte('debeaking_date', monthStart)

  const records    = data ?? []
  const totalBirds = records.reduce((s, r) => s + (r.num_birds || 0), 0)
  const byMethod   = records.reduce((acc: Record<string, number>, r) => {
    const k = r.method || 'unspecified'
    acc[k] = (acc[k] || 0) + (r.num_birds || 0)
    return acc
  }, {})

  return { totalBirds, recordCount: records.length, byMethod }
}
