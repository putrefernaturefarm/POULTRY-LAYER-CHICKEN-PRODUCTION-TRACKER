'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireUser, getCurrentFarm } from '@/lib/session'

export async function createFlock(fd: FormData) {
  await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) return { error: 'No active farm found.' }

  const supabase = await createClient()
  const initPop  = parseInt(String(fd.get('initial_population') ?? '0'))

  const payload = {
    farm_id:               farm.id,
    house_id:              fd.get('house_id') || null,
    flock_code:            String(fd.get('flock_code') ?? '').trim(),
    batch_number:          String(fd.get('batch_number') ?? ''),
    breed_strain:          String(fd.get('breed_strain') ?? ''),
    source:                String(fd.get('source') ?? ''),
    date_received:         String(fd.get('date_received') ?? ''),
    initial_population:    initPop,
    initial_males:         parseInt(String(fd.get('initial_males') ?? '0')),
    initial_females:       parseInt(String(fd.get('initial_females') ?? '0')),
    production_start_date: fd.get('production_start_date') || null,
    expected_end_date:     fd.get('expected_end_date') || null,
    status:                'active',
    notes:                 String(fd.get('notes') ?? ''),
  }

  if (!payload.flock_code) return { error: 'Flock code is required.' }
  if (!payload.date_received) return { error: 'Date received is required.' }
  if (initPop < 0) return { error: 'Initial population cannot be negative.' }

  const { error } = await supabase.from('flocks').insert(payload)
  if (error) return { error: error.message }

  revalidatePath('/flocks')
  redirect('/flocks')
}

export async function updateFlockStatus(flockId: string, status: string) {
  await requireUser()
  const supabase = await createClient()
  const { error } = await supabase
    .from('flocks')
    .update({ status })
    .eq('id', flockId)
  if (error) return { error: error.message }
  revalidatePath('/flocks')
}

export async function getFlocks(farmId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('flocks')
    .select('*, poultry_houses(name, code)')
    .eq('farm_id', farmId)
    .order('date_received', { ascending: false })
  if (error) return []
  return data ?? []
}

export async function getActiveFlock(farmId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('flocks')
    .select('*')
    .eq('farm_id', farmId)
    .eq('status', 'active')
    .limit(1)
    .single()
  return data
}
