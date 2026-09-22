'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireUser, getCurrentFarm } from '@/lib/session'

export async function createMortalityRecord(fd: FormData) {
  const user = await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) return { error: 'No active farm found.' }

  const supabase = await createClient()

  const popAtRisk = parseInt(String(fd.get('population_at_risk') ?? '0'))
  const numDeaths = parseInt(String(fd.get('num_deaths') ?? '0'))

  const flockId   = String(fd.get('flock_id') ?? '')
  const recordDate = String(fd.get('record_date') ?? '')

  if (!flockId)            return { error: 'Flock is required.' }
  if (!recordDate)         return { error: 'Record date is required.' }
  if (numDeaths <= 0)      return { error: 'Number of deaths must be greater than 0.' }
  if (popAtRisk > 0 && numDeaths > popAtRisk) return { error: 'Deaths cannot exceed population at risk.' }

  const payload = {
    farm_id:           farm.id,
    flock_id:          flockId,
    house_id:          fd.get('house_id') || null,
    morbidity_id:      fd.get('morbidity_id') || null,
    record_date:       recordDate,
    flock_age_weeks:   parseInt(String(fd.get('flock_age_weeks') ?? '0')) || null,
    population_at_risk: popAtRisk,
    num_deaths:        numDeaths,
    suspected_cause:   String(fd.get('suspected_cause') ?? ''),
    diagnostic_info:   String(fd.get('diagnostic_info') ?? ''),
    disposal_method:   fd.get('disposal_method') || null,
    notes:             String(fd.get('notes') ?? ''),
    created_by:        user.id,
  }

  const { error } = await supabase.from('mortality_records').insert(payload)
  if (error) return { error: error.message }

  revalidatePath('/mortality')
  redirect('/mortality')
}

export async function updateMortality(recordId: string, fd: FormData) {
  const farm = await getCurrentFarm()
  if (!farm) return { error: 'No active farm found.' }
  const supabase = await createClient()
  const { error } = await supabase
    .from('mortality_records')
    .update({
      record_date:       String(fd.get('record_date') ?? ''),
      flock_age_weeks:   parseInt(String(fd.get('flock_age_weeks') ?? '0')) || null,
      population_at_risk: parseInt(String(fd.get('population_at_risk') ?? '0')),
      num_deaths:        parseInt(String(fd.get('num_deaths') ?? '0')),
      suspected_cause:   String(fd.get('suspected_cause') ?? ''),
      diagnostic_info:   String(fd.get('diagnostic_info') ?? ''),
      disposal_method:   fd.get('disposal_method') || null,
      notes:             String(fd.get('notes') ?? ''),
    })
    .eq('id', recordId)
    .eq('farm_id', farm.id)
  if (error) return { error: error.message }
  revalidatePath('/mortality')
  redirect('/mortality')
}

export async function deleteMortality(recordId: string) {
  const farm = await getCurrentFarm()
  if (!farm) return { error: 'No active farm found.' }
  const supabase = await createClient()
  const { error } = await supabase
    .from('mortality_records')
    .delete()
    .eq('id', recordId)
    .eq('farm_id', farm.id)
  if (error) return { error: error.message }
  revalidatePath('/mortality')
}

export async function getMortalityRecords(farmId: string, limit = 30) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('mortality_records')
    .select('*, flocks(flock_code, breed_strain), poultry_houses(name)')
    .eq('farm_id', farmId)
    .order('record_date', { ascending: false })
    .limit(limit)
  if (error) return []
  return data ?? []
}

export async function getMortalitySummary(farmId: string) {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]
  const monthStart = today.slice(0, 7) + '-01'

  const { data } = await supabase
    .from('mortality_records')
    .select('num_deaths, mortality_rate, suspected_cause')
    .eq('farm_id', farmId)
    .gte('record_date', monthStart)

  const monthlyDeaths = (data ?? []).reduce((s, r) => s + (r.num_deaths || 0), 0)
  const avgMortRate   = (data ?? []).reduce((s, r) => s + (r.mortality_rate || 0), 0) / Math.max(1, (data ?? []).length)

  return { monthlyDeaths, avgMortRate }
}
