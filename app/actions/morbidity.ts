'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireUser, getCurrentFarm } from '@/lib/session'

export async function createMorbidityRecord(fd: FormData) {
  const user = await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) return { error: 'No active farm found.' }

  const supabase = await createClient()

  const popAtRisk  = parseInt(String(fd.get('population_at_risk') ?? '0'))
  const numAffected = parseInt(String(fd.get('num_affected') ?? '0'))

  if (numAffected < 0) return { error: 'Number of affected birds cannot be negative.' }
  if (numAffected > popAtRisk) return { error: 'Affected birds cannot exceed population at risk.' }

  const payload = {
    farm_id:               farm.id,
    flock_id:              String(fd.get('flock_id') ?? ''),
    house_id:              fd.get('house_id') || null,
    record_date:           String(fd.get('record_date') ?? ''),
    flock_age_weeks:       parseInt(String(fd.get('flock_age_weeks') ?? '0')) || null,
    population_at_risk:    popAtRisk,
    condition_disease:     String(fd.get('condition_disease') ?? '').trim(),
    clinical_signs:        String(fd.get('clinical_signs') ?? ''),
    num_affected:          numAffected,
    num_recovered:         parseInt(String(fd.get('num_recovered') ?? '0')),
    num_under_treatment:   parseInt(String(fd.get('num_under_treatment') ?? '0')),
    num_referred:          parseInt(String(fd.get('num_referred') ?? '0')),
    num_culled:            parseInt(String(fd.get('num_culled') ?? '0')),
    num_subsequently_died: parseInt(String(fd.get('num_subsequently_died') ?? '0')),
    treatment_intervention: String(fd.get('treatment_intervention') ?? ''),
    medication_used:       String(fd.get('medication_used') ?? ''),
    vaccination_history:   String(fd.get('vaccination_history') ?? ''),
    veterinarian:          String(fd.get('veterinarian') ?? ''),
    responsible_person:    String(fd.get('responsible_person') ?? ''),
    duration_days:         parseInt(String(fd.get('duration_days') ?? '0')) || null,
    outcome:               fd.get('outcome') || 'monitoring',
    notes:                 String(fd.get('notes') ?? ''),
    created_by:            user.id,
  }

  if (!payload.flock_id)        return { error: 'Flock is required.' }
  if (!payload.record_date)     return { error: 'Record date is required.' }
  if (!payload.condition_disease) return { error: 'Condition / disease name is required.' }

  const { error } = await supabase.from('morbidity_records').insert(payload)
  if (error) return { error: error.message }

  revalidatePath('/morbidity')
  redirect('/morbidity')
}

export async function updateMorbidityRecord(id: string, fd: FormData) {
  await requireUser()
  const supabase = await createClient()

  const { error } = await supabase
    .from('morbidity_records')
    .update({
      num_recovered:         parseInt(String(fd.get('num_recovered') ?? '0')),
      num_under_treatment:   parseInt(String(fd.get('num_under_treatment') ?? '0')),
      num_culled:            parseInt(String(fd.get('num_culled') ?? '0')),
      num_subsequently_died: parseInt(String(fd.get('num_subsequently_died') ?? '0')),
      outcome:               fd.get('outcome') || 'monitoring',
      is_resolved:           fd.get('is_resolved') === 'true',
      resolved_date:         fd.get('resolved_date') || null,
      notes:                 String(fd.get('notes') ?? ''),
    })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/morbidity')
  redirect('/morbidity')
}

export async function getMorbidityRecords(farmId: string, limit = 30) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('morbidity_records')
    .select('*, flocks(flock_code, breed_strain), poultry_houses(name)')
    .eq('farm_id', farmId)
    .order('record_date', { ascending: false })
    .limit(limit)
  if (error) return []
  return data ?? []
}

export async function getMorbiditySummary(farmId: string) {
  const supabase = await createClient()

  // Active (unresolved) cases
  const { data: activeCases } = await supabase
    .from('morbidity_records')
    .select('num_affected, num_recovered, num_under_treatment, morbidity_rate, condition_disease')
    .eq('farm_id', farmId)
    .eq('is_resolved', false)

  const totalAffected       = (activeCases ?? []).reduce((s, r) => s + (r.num_affected || 0), 0)
  const totalUnderTreatment = (activeCases ?? []).reduce((s, r) => s + (r.num_under_treatment || 0), 0)
  const totalRecovered      = (activeCases ?? []).reduce((s, r) => s + (r.num_recovered || 0), 0)
  const activeCaseCount     = (activeCases ?? []).length
  const avgMorbRate         = (activeCases ?? []).reduce((s, r) => s + (r.morbidity_rate || 0), 0) / Math.max(1, activeCaseCount)

  return { totalAffected, totalUnderTreatment, totalRecovered, activeCaseCount, avgMorbRate }
}
