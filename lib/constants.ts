export const FEED_TYPES = [
  { value: 'layer_mash',    label: 'Layer Mash' },
  { value: 'layer_pellet',  label: 'Layer Pellet' },
  { value: 'layer_crumble', label: 'Layer Crumble' },
  { value: 'pre_layer',     label: 'Pre-Layer Feed' },
  { value: 'grower',        label: 'Grower Feed' },
  { value: 'starter',       label: 'Chick Starter' },
  { value: 'breeder',       label: 'Breeder Feed' },
  { value: 'scratch',       label: 'Scratch Grains' },
  { value: 'concentrate',   label: 'Feed Concentrate' },
  { value: 'supplement',    label: 'Feed Supplement' },
  { value: 'other',         label: 'Other' },
] as const

export const EXPENSE_CATEGORIES = [
  { value: 'feed',         label: 'Feed' },
  { value: 'vaccines',     label: 'Vaccines' },
  { value: 'medication',   label: 'Medication' },
  { value: 'labor',        label: 'Labor' },
  { value: 'electricity',  label: 'Electricity' },
  { value: 'water',        label: 'Water' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'repairs',      label: 'Repairs & Maintenance' },
  { value: 'equipment',    label: 'Equipment' },
  { value: 'packaging',    label: 'Packaging' },
  { value: 'veterinary',   label: 'Veterinary Services' },
  { value: 'chicks',       label: 'Day-Old Chicks / Pullets' },
  { value: 'bedding',      label: 'Bedding / Litter' },
  { value: 'other',        label: 'Other' },
] as const

export const EGG_GRADES = [
  { value: 'jumbo',       label: 'Jumbo' },
  { value: 'extra_large', label: 'Extra Large' },
  { value: 'large',       label: 'Large' },
  { value: 'medium',      label: 'Medium' },
  { value: 'small',       label: 'Small' },
  { value: 'peewee',      label: 'Peewee' },
  { value: 'cracked',     label: 'Cracked' },
  { value: 'dirty',       label: 'Dirty' },
  { value: 'rejected',    label: 'Rejected' },
] as const

export const HOUSING_TYPES = [
  { value: 'cage',           label: 'Cage (Conventional Battery)' },
  { value: 'battery_cage',   label: 'Battery Cage' },
  { value: 'enriched_cage',  label: 'Enriched Cage' },
  { value: 'floor',          label: 'Floor (Deep Litter)' },
  { value: 'free_range',     label: 'Free Range' },
] as const

export const FLOCK_STATUS = [
  { value: 'active',      label: 'Active' },
  { value: 'completed',   label: 'Completed' },
  { value: 'culled',      label: 'Culled' },
  { value: 'sold',        label: 'Sold' },
  { value: 'transferred', label: 'Transferred' },
] as const

export const VACCINATION_ROUTES = [
  { value: 'drinking_water', label: 'Drinking Water' },
  { value: 'spray',          label: 'Spray' },
  { value: 'eye_drop',       label: 'Eye Drop' },
  { value: 'wing_web',       label: 'Wing Web' },
  { value: 'subcutaneous',   label: 'Subcutaneous Injection' },
  { value: 'intramuscular',  label: 'Intramuscular Injection' },
  { value: 'oral',           label: 'Oral' },
  { value: 'intranasal',     label: 'Intranasal' },
] as const

export const MEDICATION_ROUTES = [
  { value: 'drinking_water', label: 'Drinking Water' },
  { value: 'feed',           label: 'Mixed in Feed' },
  { value: 'injection',      label: 'Injection' },
  { value: 'topical',        label: 'Topical' },
  { value: 'oral',           label: 'Oral' },
  { value: 'eye_drop',       label: 'Eye Drop' },
] as const

export const CULLING_REASONS = [
  { value: 'poor_production', label: 'Poor Production' },
  { value: 'disease',         label: 'Disease' },
  { value: 'injury',          label: 'Injury' },
  { value: 'old_age',         label: 'Old Age / End of Cycle' },
  { value: 'excess_males',    label: 'Excess Males' },
  { value: 'other',           label: 'Other' },
] as const

export const DISPOSAL_METHODS = [
  { value: 'sold',        label: 'Sold' },
  { value: 'buried',      label: 'Buried' },
  { value: 'composted',   label: 'Composted' },
  { value: 'incinerated', label: 'Incinerated' },
  { value: 'other',       label: 'Other' },
] as const

export const SALE_TYPES = [
  { value: 'eggs',       label: 'Eggs' },
  { value: 'live_birds', label: 'Live Birds' },
  { value: 'spent_hens', label: 'Spent Hens' },
  { value: 'culls',      label: 'Culled Birds' },
  { value: 'manure',     label: 'Manure / Fertilizer' },
  { value: 'other',      label: 'Other' },
] as const

export const USER_ROLES = [
  { value: 'owner',        label: 'Owner' },
  { value: 'farm_manager', label: 'Farm Manager' },
  { value: 'staff',        label: 'Farm Staff' },
  { value: 'technician',   label: 'Technician' },
  { value: 'viewer',       label: 'Viewer (Read Only)' },
] as const

export const HEALTH_OUTCOMES = [
  { value: 'recovered',         label: 'Recovered' },
  { value: 'under_treatment',   label: 'Under Treatment' },
  { value: 'culled',            label: 'Culled' },
  { value: 'died',              label: 'Died' },
  { value: 'referred',          label: 'Referred' },
  { value: 'monitoring',        label: 'Monitoring' },
] as const

export const ALERT_TYPES = [
  { value: 'high_morbidity',        label: 'High Morbidity' },
  { value: 'high_mortality',        label: 'High Mortality' },
  { value: 'low_feed',              label: 'Low Feed Inventory' },
  { value: 'low_vaccine',           label: 'Low Vaccine Inventory' },
  { value: 'low_medicine',          label: 'Low Medicine Inventory' },
  { value: 'production_drop',       label: 'Production Drop' },
  { value: 'abnormal_feed',         label: 'Abnormal Feed Consumption' },
  { value: 'medication_withdrawal', label: 'Medication Withdrawal Period' },
  { value: 'vaccination_due',       label: 'Vaccination Due' },
  { value: 'other',                 label: 'Other' },
] as const

export const INVENTORY_ACTIONS = [
  { value: 'purchase',    label: 'Purchase / Received' },
  { value: 'usage',       label: 'Usage / Consumed' },
  { value: 'adjustment',  label: 'Stock Adjustment' },
  { value: 'transfer',    label: 'Transfer' },
  { value: 'expired',     label: 'Expired' },
  { value: 'damaged',     label: 'Damaged' },
  { value: 'return',      label: 'Return' },
  { value: 'opening',     label: 'Opening Balance' },
] as const
