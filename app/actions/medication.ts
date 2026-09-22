'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireUser, getCurrentFarm } from '@/lib/session'

export async function createMedicationRecord(fd: FormData) {
  const user = await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) return { error: 'No active farm found.' }

  const startDate    = fd.get('start_date') as string
  const medName      = (fd.get('medication_name') as string)?.trim()

  if (!startDate) return { error: 'Start date is required.' }
  if (!medName)   return { error: 'Medication name is required.' }

  const numBirds    = parseInt(String(fd.get('num_birds_treated') ?? ''))
  const withdrawal  = parseInt(String(fd.get('withdrawal_period_days') ?? ''))

  const supabase = await createClient()
  const { error } = await supabase.from('medication_records').insert({
    farm_id:                 farm.id,
    flock_id:                fd.get('flock_id') || null,
    house_id:                fd.get('house_id') || null,
    start_date:              startDate,
    end_date:                fd.get('end_date') || null,
    medication_name:         medName,
    purpose:                 String(fd.get('purpose') ?? '') || null,
    route:                   fd.get('route') || null,
    dose_per_bird:           String(fd.get('dose_per_bird') ?? '') || null,
    num_birds_treated:       isNaN(numBirds) ? null : numBirds,
    withdrawal_period_days:  isNaN(withdrawal) ? null : withdrawal,
    administered_by:         String(fd.get('administered_by') ?? '') || null,
    notes:                   String(fd.get('notes') ?? '') || null,
    created_by:              user.id,
  })

  if (error) return { error: error.message }
  revalidatePath('/medication')
  redirect('/medication')
}

export async function updateMedicationRecord(recordId: string, fd: FormData) {
  const farm = await getCurrentFarm()
  if (!farm) return { error: 'No active farm found.' }
  const numBirds   = parseInt(String(fd.get('num_birds_treated') ?? ''))
  const withdrawal = parseInt(String(fd.get('withdrawal_period_days') ?? ''))
  const supabase = await createClient()
  const { error } = await supabase
    .from('medication_records')
    .update({
      flock_id:               fd.get('flock_id') || null,
      house_id:               fd.get('house_id') || null,
      start_date:             String(fd.get('start_date') ?? ''),
      end_date:               fd.get('end_date') || null,
      medication_name:        String(fd.get('medication_name') ?? ''),
      purpose:                String(fd.get('purpose') ?? '') || null,
      route:                  fd.get('route') || null,
      dose_per_bird:          String(fd.get('dose_per_bird') ?? '') || null,
      num_birds_treated:      isNaN(numBirds) ? null : numBirds,
      withdrawal_period_days: isNaN(withdrawal) ? null : withdrawal,
      administered_by:        String(fd.get('administered_by') ?? '') || null,
      notes:                  String(fd.get('notes') ?? '') || null,
    })
    .eq('id', recordId)
    .eq('farm_id', farm.id)
  if (error) return { error: error.message }
  revalidatePath('/medication')
  redirect('/medication')
}

export async function deleteMedicationRecord(recordId: string) {
  const farm = await getCurrentFarm()
  if (!farm) return { error: 'No active farm found.' }
  const supabase = await createClient()
  const { error } = await supabase
    .from('medication_records')
    .delete()
    .eq('id', recordId)
    .eq('farm_id', farm.id)
  if (error) return { error: error.message }
  revalidatePath('/medication')
}

export async function getMedicationRecords(farmId: string, limit = 50) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('medication_records')
    .select('*, flocks(flock_code), poultry_houses(name)')
    .eq('farm_id', farmId)
    .order('start_date', { ascending: false })
    .limit(limit)
  return data ?? []
}

export async function getMedicationSummary(farmId: string) {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]
  const monthStart = today.slice(0, 7) + '-01'

  const [{ data: monthData }, { data: activeData }] = await Promise.all([
    supabase.from('medication_records').select('id').eq('farm_id', farmId).gte('start_date', monthStart),
    supabase.from('medication_records').select('id, medication_name, end_date, withdrawal_period_days, flocks(flock_code)')
      .eq('farm_id', farmId).or(`end_date.is.null,end_date.gte.${today}`).order('start_date', { ascending: false }),
  ])

  return { monthCount: (monthData ?? []).length, activeTreatments: activeData ?? [] }
}
