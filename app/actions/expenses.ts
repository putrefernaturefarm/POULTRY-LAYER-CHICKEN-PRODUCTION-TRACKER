'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireUser, getCurrentFarm } from '@/lib/session'

export async function createExpense(fd: FormData) {
  const user = await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) return { error: 'No active farm found.' }

  const supabase = await createClient()
  const amount = parseFloat(String(fd.get('amount') ?? '0'))

  if (amount < 0) return { error: 'Amount cannot be negative.' }

  const { error } = await supabase.from('expenses').insert({
    farm_id:      farm.id,
    flock_id:     fd.get('flock_id') || null,
    expense_date: String(fd.get('expense_date') ?? ''),
    category:     String(fd.get('category') ?? ''),
    description:  String(fd.get('description') ?? ''),
    amount,
    supplier:     String(fd.get('supplier') ?? ''),
    receipt_no:   String(fd.get('receipt_no') ?? ''),
    notes:        String(fd.get('notes') ?? ''),
    created_by:   user.id,
  })

  if (error) return { error: error.message }
  revalidatePath('/expenses')
  redirect('/expenses')
}

export async function getExpenses(farmId: string, limit = 50) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('expenses')
    .select('*, flocks(flock_code)')
    .eq('farm_id', farmId)
    .order('expense_date', { ascending: false })
    .limit(limit)
  if (error) return []
  return data ?? []
}

export async function getExpenseSummary(farmId: string) {
  const supabase = await createClient()
  const monthStart = new Date().toISOString().slice(0, 7) + '-01'

  const { data } = await supabase
    .from('expenses')
    .select('amount, category')
    .eq('farm_id', farmId)
    .gte('expense_date', monthStart)

  const total = (data ?? []).reduce((s, r) => s + (r.amount || 0), 0)

  const byCategory = (data ?? []).reduce((acc: Record<string, number>, r) => {
    acc[r.category] = (acc[r.category] || 0) + (r.amount || 0)
    return acc
  }, {})

  return { total, byCategory }
}
