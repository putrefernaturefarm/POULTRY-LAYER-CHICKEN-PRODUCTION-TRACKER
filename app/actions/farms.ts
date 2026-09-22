'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/session'

export async function createFarm(fd: FormData) {
  const user = await requireUser()
  const supabase = await createClient()

  const payload = {
    owner_id:       user.id,
    name:           String(fd.get('name') ?? '').trim(),
    address:        String(fd.get('address') ?? ''),
    municipality:   String(fd.get('municipality') ?? ''),
    province:       String(fd.get('province') ?? ''),
    region:         String(fd.get('region') ?? ''),
    contact_person: String(fd.get('contact_person') ?? ''),
    contact_phone:  String(fd.get('contact_phone') ?? ''),
    contact_email:  String(fd.get('contact_email') ?? ''),
    notes:          String(fd.get('notes') ?? ''),
  }

  if (!payload.name) return { error: 'Farm name is required.' }

  const { error } = await supabase.from('farms').insert(payload)
  if (error) return { error: error.message }

  revalidatePath('/farms')
  redirect('/farms')
}

export async function updateFarm(farmId: string, fd: FormData) {
  const user = await requireUser()
  const supabase = await createClient()

  const { error } = await supabase
    .from('farms')
    .update({
      name:           String(fd.get('name') ?? '').trim(),
      address:        String(fd.get('address') ?? ''),
      municipality:   String(fd.get('municipality') ?? ''),
      province:       String(fd.get('province') ?? ''),
      region:         String(fd.get('region') ?? ''),
      contact_person: String(fd.get('contact_person') ?? ''),
      contact_phone:  String(fd.get('contact_phone') ?? ''),
      contact_email:  String(fd.get('contact_email') ?? ''),
      notes:          String(fd.get('notes') ?? ''),
    })
    .eq('id', farmId)
    .eq('owner_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/farms')
  redirect('/farms')
}

export async function getFarms() {
  const user = await requireUser()
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('farms')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: true })
  if (error) return []
  return data ?? []
}
