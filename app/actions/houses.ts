'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentFarm } from '@/lib/session'

export async function updateHouse(houseId: string, fd: FormData) {
  const farm = await getCurrentFarm()
  if (!farm) return { error: 'No active farm found.' }
  const supabase = await createClient()
  const { error } = await supabase
    .from('poultry_houses')
    .update({
      name:         String(fd.get('name') ?? '').trim(),
      code:         String(fd.get('code') ?? '') || null,
      housing_type: fd.get('housing_type') || null,
      capacity:     parseInt(String(fd.get('capacity') ?? '0')) || null,
      description:  String(fd.get('description') ?? '') || null,
      is_active:    fd.get('is_active') === 'true',
    })
    .eq('id', houseId)
    .eq('farm_id', farm.id)
  if (error) return { error: error.message }
  revalidatePath('/houses')
  redirect('/houses')
}
