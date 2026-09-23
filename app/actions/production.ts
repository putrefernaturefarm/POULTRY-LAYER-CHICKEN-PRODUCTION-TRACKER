'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireUser, getCurrentFarm } from '@/lib/session'

export async function createDailyProduction(fd: FormData) {
  const user = await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) return { error: 'No active farm found.' }

  const supabase = await createClient()

  const hensPres   = parseInt(String(fd.get('hens_present') ?? '0'))
  const totalEggs  = parseInt(String(fd.get('total_eggs') ?? '0'))
  const goodEggs   = parseInt(String(fd.get('good_eggs') ?? '0'))
  const cracked    = parseInt(String(fd.get('cracked_eggs') ?? '0'))
  const dirty      = parseInt(String(fd.get('dirty_eggs') ?? '0'))
  const broken     = parseInt(String(fd.get('broken_eggs') ?? '0'))
  const rejected   = parseInt(String(fd.get('rejected_eggs') ?? '0'))
  const otherLoss  = parseInt(String(fd.get('other_losses') ?? '0'))

  if (hensPres < 0) return { error: 'Hens present cannot be negative.' }
  if (totalEggs < 0) return { error: 'Total eggs cannot be negative.' }
  if (goodEggs > totalEggs) return { error: 'Good eggs cannot exceed total eggs.' }

  const payload = {
    flock_id:         String(fd.get('flock_id') ?? ''),
    farm_id:          farm.id,
    house_id:         fd.get('house_id') || null,
    record_date:      String(fd.get('record_date') ?? ''),
    hens_present:     hensPres,
    total_eggs:       totalEggs,
    good_eggs:        goodEggs,
    cracked_eggs:     cracked,
    dirty_eggs:       dirty,
    broken_eggs:      broken,
    rejected_eggs:    rejected,
    other_losses:     otherLoss,
    eggs_jumbo:       parseInt(String(fd.get('eggs_jumbo')       ?? '0')) || 0,
    eggs_extra_large: parseInt(String(fd.get('eggs_extra_large') ?? '0')) || 0,
    eggs_large:       parseInt(String(fd.get('eggs_large')       ?? '0')) || 0,
    eggs_medium:      parseInt(String(fd.get('eggs_medium')      ?? '0')) || 0,
    eggs_small:       parseInt(String(fd.get('eggs_small')       ?? '0')) || 0,
    eggs_peewee:      parseInt(String(fd.get('eggs_peewee')      ?? '0')) || 0,
    notes:            String(fd.get('notes') ?? ''),
    created_by:       user.id,
  }

  if (!payload.flock_id) return { error: 'Flock is required.' }
  if (!payload.record_date) return { error: 'Record date is required.' }

  const { error } = await supabase.from('daily_production').insert(payload)
  if (error) {
    if (error.code === '23505') return { error: 'A production record for this flock and date already exists.' }
    return { error: error.message }
  }

  revalidatePath('/production')
  return { success: true }
}

export async function updateProduction(recordId: string, fd: FormData) {
  const farm = await getCurrentFarm()
  if (!farm) return { error: 'No active farm found.' }
  const supabase = await createClient()
  const { error } = await supabase
    .from('daily_production')
    .update({
      hens_present:     parseInt(String(fd.get('hens_present')     ?? '0')),
      total_eggs:       parseInt(String(fd.get('total_eggs')        ?? '0')),
      good_eggs:        parseInt(String(fd.get('good_eggs')         ?? '0')),
      cracked_eggs:     parseInt(String(fd.get('cracked_eggs')      ?? '0')),
      dirty_eggs:       parseInt(String(fd.get('dirty_eggs')        ?? '0')),
      broken_eggs:      parseInt(String(fd.get('broken_eggs')       ?? '0')),
      rejected_eggs:    parseInt(String(fd.get('rejected_eggs')     ?? '0')),
      other_losses:     parseInt(String(fd.get('other_losses')      ?? '0')),
      eggs_jumbo:       parseInt(String(fd.get('eggs_jumbo')        ?? '0')) || 0,
      eggs_extra_large: parseInt(String(fd.get('eggs_extra_large')  ?? '0')) || 0,
      eggs_large:       parseInt(String(fd.get('eggs_large')        ?? '0')) || 0,
      eggs_medium:      parseInt(String(fd.get('eggs_medium')       ?? '0')) || 0,
      eggs_small:       parseInt(String(fd.get('eggs_small')        ?? '0')) || 0,
      eggs_peewee:      parseInt(String(fd.get('eggs_peewee')       ?? '0')) || 0,
      notes:            String(fd.get('notes') ?? ''),
    })
    .eq('id', recordId)
    .eq('farm_id', farm.id)
  if (error) return { error: error.message }
  revalidatePath('/production')
  return { success: true }
}

export async function getDailyProduction(farmId: string, limit = 30) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('daily_production')
    .select('*, flocks(flock_code, breed_strain), poultry_houses(name)')
    .eq('farm_id', farmId)
    .order('record_date', { ascending: false })
    .limit(limit)
  if (error) return []
  return data ?? []
}

export async function deleteProduction(recordId: string) {
  const farm = await getCurrentFarm()
  if (!farm) return { error: 'No active farm found.' }
  const supabase = await createClient()
  const { error } = await supabase
    .from('daily_production')
    .delete()
    .eq('id', recordId)
    .eq('farm_id', farm.id)
  if (error) return { error: error.message }
  revalidatePath('/production')
}

export async function getProductionSummary(farmId: string) {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]
  const monthStart = today.slice(0, 7) + '-01'

  const { data: todayData } = await supabase
    .from('daily_production')
    .select('total_eggs, good_eggs, hens_present, hen_day_pct')
    .eq('farm_id', farmId)
    .eq('record_date', today)

  const { data: monthData } = await supabase
    .from('daily_production')
    .select('total_eggs, good_eggs, hens_present')
    .eq('farm_id', farmId)
    .gte('record_date', monthStart)

  const todayEggs  = (todayData ?? []).reduce((s, r) => s + (r.total_eggs || 0), 0)
  const monthEggs  = (monthData ?? []).reduce((s, r) => s + (r.total_eggs || 0), 0)
  const avgHdp     = (todayData ?? []).reduce((s, r) => s + (r.hen_day_pct || 0), 0) / Math.max(1, (todayData ?? []).length)

  return { todayEggs, monthEggs, avgHdp }
}
