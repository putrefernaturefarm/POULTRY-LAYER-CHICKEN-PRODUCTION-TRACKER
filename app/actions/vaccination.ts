'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireUser, getCurrentFarm } from '@/lib/session'

export async function createVaccinationRecord(fd: FormData) {
  const user = await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) return { error: 'No active farm found.' }

  const vaccinationDate = fd.get('vaccination_date') as string
  const vaccineName     = (fd.get('vaccine_name') as string)?.trim()

  if (!vaccinationDate) return { error: 'Vaccination date is required.' }
  if (!vaccineName)     return { error: 'Vaccine name is required.' }

  const numBirds = parseInt(String(fd.get('num_birds_vaccinated') ?? ''))

  const supabase = await createClient()
  const { error } = await supabase.from('vaccination_records').insert({
    farm_id:               farm.id,
    flock_id:              fd.get('flock_id') || null,
    house_id:              fd.get('house_id') || null,
    vaccination_date:      vaccinationDate,
    vaccine_name:          vaccineName,
    disease_target:        String(fd.get('disease_target') ?? '') || null,
    route:                 fd.get('route') || null,
    dose_per_bird:         String(fd.get('dose_per_bird') ?? '') || null,
    num_birds_vaccinated:  isNaN(numBirds) ? null : numBirds,
    manufacturer:          String(fd.get('manufacturer') ?? '') || null,
    batch_no:              String(fd.get('batch_no') ?? '') || null,
    expiry_date:           fd.get('expiry_date') || null,
    administered_by:       String(fd.get('administered_by') ?? '') || null,
    next_due_date:         fd.get('next_due_date') || null,
    notes:                 String(fd.get('notes') ?? '') || null,
    created_by:            user.id,
  })

  if (error) return { error: error.message }
  revalidatePath('/vaccination')
  redirect('/vaccination')
}

export async function updateVaccinationRecord(recordId: string, fd: FormData) {
  const farm = await getCurrentFarm()
  if (!farm) return { error: 'No active farm found.' }
  const numBirds = parseInt(String(fd.get('num_birds_vaccinated') ?? ''))
  const supabase = await createClient()
  const { error } = await supabase
    .from('vaccination_records')
    .update({
      flock_id:             fd.get('flock_id') || null,
      house_id:             fd.get('house_id') || null,
      vaccination_date:     String(fd.get('vaccination_date') ?? ''),
      vaccine_name:         String(fd.get('vaccine_name') ?? ''),
      disease_target:       String(fd.get('disease_target') ?? '') || null,
      route:                fd.get('route') || null,
      dose_per_bird:        String(fd.get('dose_per_bird') ?? '') || null,
      num_birds_vaccinated: isNaN(numBirds) ? null : numBirds,
      manufacturer:         String(fd.get('manufacturer') ?? '') || null,
      batch_no:             String(fd.get('batch_no') ?? '') || null,
      expiry_date:          fd.get('expiry_date') || null,
      administered_by:      String(fd.get('administered_by') ?? '') || null,
      next_due_date:        fd.get('next_due_date') || null,
      notes:                String(fd.get('notes') ?? '') || null,
    })
    .eq('id', recordId)
    .eq('farm_id', farm.id)
  if (error) return { error: error.message }
  revalidatePath('/vaccination')
  redirect('/vaccination')
}

export async function deleteVaccinationRecord(recordId: string) {
  const farm = await getCurrentFarm()
  if (!farm) return { error: 'No active farm found.' }
  const supabase = await createClient()
  const { error } = await supabase
    .from('vaccination_records')
    .delete()
    .eq('id', recordId)
    .eq('farm_id', farm.id)
  if (error) return { error: error.message }
  revalidatePath('/vaccination')
}

export async function getVaccinationRecords(farmId: string, limit = 50) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('vaccination_records')
    .select('*, flocks(flock_code), poultry_houses(name)')
    .eq('farm_id', farmId)
    .order('vaccination_date', { ascending: false })
    .limit(limit)
  return data ?? []
}

export async function getVaccinationSummary(farmId: string) {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]
  const thirtyDays = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]

  const [{ data: recent }, { data: upcoming }] = await Promise.all([
    supabase.from('vaccination_records').select('id').eq('farm_id', farmId)
      .gte('vaccination_date', new Date().toISOString().slice(0, 7) + '-01'),
    supabase.from('vaccination_records').select('id, vaccine_name, next_due_date, flocks(flock_code)')
      .eq('farm_id', farmId)
      .gte('next_due_date', today)
      .lte('next_due_date', thirtyDays)
      .order('next_due_date'),
  ])

  return { monthCount: (recent ?? []).length, upcomingDue: upcoming ?? [] }
}
