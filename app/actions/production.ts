'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
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
    flock_id:     String(fd.get('flock_id') ?? ''),
    farm_id:      farm.id,
    house_id:     fd.get('house_id') || null,
    record_date:  String(fd.get('record_date') ?? ''),
    hens_present: hensPres,
    total_eggs:   totalEggs,
    good_eggs:    goodEggs,
    cracked_eggs: cracked,
    dirty_eggs:   dirty,
    broken_eggs:  broken,
    rejected_eggs: rejected,
    other_losses: otherLoss,
    notes:        String(fd.get('notes') ?? ''),
    created_by:   user.id,
  }

  if (!payload.flock_id) return { error: 'Flock is required.' }
  if (!payload.record_date) return { error: 'Record date is required.' }

  const { error } = await supabase.from('daily_production').insert(payload)
  if (error) {
    if (error.code === '23505') return { error: 'A production record for this flock and date already exists.' }
    return { error: error.message }
  }

  revalidatePath('/production')
  redirect('/production')
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
