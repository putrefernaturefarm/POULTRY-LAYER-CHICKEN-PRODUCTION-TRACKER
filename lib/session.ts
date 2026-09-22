import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  return user
}

export async function getCurrentFarm(farmId?: string) {
  const supabase = await createClient()
  const user = await requireUser()

  if (farmId) {
    const { data } = await supabase
      .from('farms')
      .select('*')
      .eq('id', farmId)
      .single()
    return data
  }

  // Return first active farm for this user
  const { data } = await supabase
    .from('farms')
    .select('*')
    .eq('owner_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  return data
}
