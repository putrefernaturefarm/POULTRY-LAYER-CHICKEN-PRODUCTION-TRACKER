'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireUser, getCurrentFarm } from '@/lib/session'

export async function createSale(fd: FormData) {
  const user = await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) return { error: 'No active farm found.' }

  const supabase = await createClient()
  const qty       = parseFloat(String(fd.get('quantity') ?? '0'))
  const unitPrice = parseFloat(String(fd.get('unit_price') ?? '0'))

  if (qty < 0)       return { error: 'Quantity cannot be negative.' }
  if (unitPrice < 0) return { error: 'Unit price cannot be negative.' }

  const { error } = await supabase.from('sales').insert({
    farm_id:          farm.id,
    flock_id:         fd.get('flock_id') || null,
    sale_date:        String(fd.get('sale_date') ?? ''),
    sale_type:        String(fd.get('sale_type') ?? ''),
    customer_name:    String(fd.get('customer_name') ?? ''),
    customer_contact: String(fd.get('customer_contact') ?? ''),
    quantity:         qty,
    unit:             String(fd.get('unit') ?? ''),
    unit_price:       unitPrice,
    egg_grade:        fd.get('egg_grade') || null,
    description:      String(fd.get('description') ?? ''),
    receipt_no:       String(fd.get('receipt_no') ?? ''),
    notes:            String(fd.get('notes') ?? ''),
    created_by:       user.id,
  })

  if (error) return { error: error.message }
  revalidatePath('/sales')
  redirect('/sales')
}

export async function updateSale(saleId: string, fd: FormData) {
  const farm = await getCurrentFarm()
  if (!farm) return { error: 'No active farm found.' }
  const supabase = await createClient()
  const qty       = parseFloat(String(fd.get('quantity') ?? '0'))
  const unitPrice = parseFloat(String(fd.get('unit_price') ?? '0'))
  const { error } = await supabase
    .from('sales')
    .update({
      flock_id:         fd.get('flock_id') || null,
      sale_date:        String(fd.get('sale_date') ?? ''),
      sale_type:        String(fd.get('sale_type') ?? ''),
      customer_name:    String(fd.get('customer_name') ?? ''),
      customer_contact: String(fd.get('customer_contact') ?? ''),
      quantity:         qty,
      unit:             String(fd.get('unit') ?? ''),
      unit_price:       unitPrice,
      egg_grade:        fd.get('egg_grade') || null,
      description:      String(fd.get('description') ?? ''),
      receipt_no:       String(fd.get('receipt_no') ?? ''),
      notes:            String(fd.get('notes') ?? ''),
    })
    .eq('id', saleId)
    .eq('farm_id', farm.id)
  if (error) return { error: error.message }
  revalidatePath('/sales')
  redirect('/sales')
}

export async function getSales(farmId: string, limit = 50) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sales')
    .select('*, flocks(flock_code)')
    .eq('farm_id', farmId)
    .order('sale_date', { ascending: false })
    .limit(limit)
  if (error) return []
  return data ?? []
}

export async function getSalesSummary(farmId: string) {
  const supabase = await createClient()
  const monthStart = new Date().toISOString().slice(0, 7) + '-01'

  const { data } = await supabase
    .from('sales')
    .select('total_amount, sale_type, quantity')
    .eq('farm_id', farmId)
    .gte('sale_date', monthStart)

  const total     = (data ?? []).reduce((s, r) => s + (r.total_amount || 0), 0)
  const eggSales  = (data ?? []).filter(r => r.sale_type === 'eggs')
                        .reduce((s, r) => s + (r.total_amount || 0), 0)
  const birdSales = (data ?? []).filter(r => r.sale_type !== 'eggs')
                        .reduce((s, r) => s + (r.total_amount || 0), 0)
  const eggQty    = (data ?? []).filter(r => r.sale_type === 'eggs')
                        .reduce((s, r) => s + (r.quantity || 0), 0)

  return { total, eggSales, birdSales, eggQty }
}
