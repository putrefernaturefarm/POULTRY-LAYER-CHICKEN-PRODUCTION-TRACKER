'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireUser, getCurrentFarm } from '@/lib/session'

export async function createFeedRecord(fd: FormData) {
  const user = await requireUser()
  const farm = await getCurrentFarm()
  if (!farm) return { error: 'No active farm found.' }

  const flockId    = fd.get('flock_id') as string | null
  const recordDate = fd.get('record_date') as string

  if (!flockId)    return { error: 'Flock is required.' }
  if (!recordDate) return { error: 'Record date is required.' }

  const feedType = fd.get('feed_type') as string
  if (!feedType)   return { error: 'Feed type is required.' }

  const numBags    = parseFloat(String(fd.get('num_bags') ?? ''))
  const bagSizeKg  = parseFloat(String(fd.get('bag_size_kg') ?? ''))
  const directKg   = parseFloat(String(fd.get('quantity_kg') ?? ''))
  const costPerBag = parseFloat(String(fd.get('cost_per_bag') ?? ''))
  const directCost = parseFloat(String(fd.get('total_cost') ?? ''))

  const quantityKg = !isNaN(numBags) && !isNaN(bagSizeKg) && numBags > 0 && bagSizeKg > 0
    ? numBags * bagSizeKg
    : directKg

  if (isNaN(quantityKg) || quantityKg <= 0)
    return { error: 'Quantity must be greater than 0.' }

  const totalCost = !isNaN(numBags) && !isNaN(costPerBag) && costPerBag > 0
    ? numBags * costPerBag
    : isNaN(directCost) ? null : directCost

  const hensPresent = parseInt(String(fd.get('hens_present') ?? ''))

  const supabase = await createClient()
  const { error } = await supabase.from('feed_records').insert({
    farm_id:      farm.id,
    flock_id:     flockId || null,
    house_id:     fd.get('house_id') || null,
    record_date:  recordDate,
    feed_type:    feedType,
    brand:        String(fd.get('brand') ?? '') || null,
    quantity_kg:  quantityKg,
    num_bags:     isNaN(numBags) ? null : numBags,
    bag_size_kg:  isNaN(bagSizeKg) ? null : bagSizeKg,
    cost_per_bag: isNaN(costPerBag) ? null : costPerBag,
    total_cost:   totalCost,
    hens_present: isNaN(hensPresent) ? null : hensPresent,
    notes:        String(fd.get('notes') ?? '') || null,
    created_by:   user.id,
  })

  if (error) return { error: error.message }
  revalidatePath('/feed')
  redirect('/feed')
}

export async function updateFeedRecord(recordId: string, fd: FormData) {
  const farm = await getCurrentFarm()
  if (!farm) return { error: 'No active farm found.' }

  const numBags    = parseFloat(String(fd.get('num_bags') ?? ''))
  const bagSizeKg  = parseFloat(String(fd.get('bag_size_kg') ?? ''))
  const directKg   = parseFloat(String(fd.get('quantity_kg') ?? ''))
  const costPerBag = parseFloat(String(fd.get('cost_per_bag') ?? ''))
  const directCost = parseFloat(String(fd.get('total_cost') ?? ''))

  const quantityKg = !isNaN(numBags) && !isNaN(bagSizeKg) && numBags > 0 && bagSizeKg > 0
    ? numBags * bagSizeKg
    : directKg

  const totalCost = !isNaN(numBags) && !isNaN(costPerBag) && costPerBag > 0
    ? numBags * costPerBag
    : isNaN(directCost) ? null : directCost

  const hensPresent = parseInt(String(fd.get('hens_present') ?? ''))

  const supabase = await createClient()
  const { error } = await supabase
    .from('feed_records')
    .update({
      flock_id:     fd.get('flock_id') || null,
      house_id:     fd.get('house_id') || null,
      record_date:  String(fd.get('record_date') ?? ''),
      feed_type:    String(fd.get('feed_type') ?? ''),
      brand:        String(fd.get('brand') ?? '') || null,
      quantity_kg:  isNaN(quantityKg) ? 0 : quantityKg,
      num_bags:     isNaN(numBags) ? null : numBags,
      bag_size_kg:  isNaN(bagSizeKg) ? null : bagSizeKg,
      cost_per_bag: isNaN(costPerBag) ? null : costPerBag,
      total_cost:   totalCost,
      hens_present: isNaN(hensPresent) ? null : hensPresent,
      notes:        String(fd.get('notes') ?? '') || null,
    })
    .eq('id', recordId)
    .eq('farm_id', farm.id)

  if (error) return { error: error.message }
  revalidatePath('/feed')
  redirect('/feed')
}

export async function deleteFeedRecord(recordId: string) {
  const farm = await getCurrentFarm()
  if (!farm) return { error: 'No active farm found.' }
  const supabase = await createClient()
  const { error } = await supabase
    .from('feed_records')
    .delete()
    .eq('id', recordId)
    .eq('farm_id', farm.id)
  if (error) return { error: error.message }
  revalidatePath('/feed')
}

export async function getFeedRecords(farmId: string, limit = 50) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('feed_records')
    .select('*, flocks(flock_code), poultry_houses(name)')
    .eq('farm_id', farmId)
    .order('record_date', { ascending: false })
    .limit(limit)
  if (error) return []
  return data ?? []
}

export async function getFeedSummary(farmId: string) {
  const supabase = await createClient()
  const monthStart = new Date().toISOString().slice(0, 7) + '-01'

  const { data } = await supabase
    .from('feed_records')
    .select('quantity_kg, total_cost, hens_present, record_date')
    .eq('farm_id', farmId)
    .gte('record_date', monthStart)

  const records = data ?? []
  const totalKg   = records.reduce((s, r) => s + (r.quantity_kg || 0), 0)
  const totalCost = records.reduce((s, r) => s + (r.total_cost || 0), 0)

  const daysWithHens = records.filter(r => (r.hens_present || 0) > 0)
  const avgFeedPerBird = daysWithHens.length > 0
    ? daysWithHens.reduce((s, r) => s + (r.quantity_kg * 1000) / (r.hens_present || 1), 0) / daysWithHens.length
    : 0

  return { totalKg, totalCost, avgFeedPerBird, recordCount: records.length }
}
