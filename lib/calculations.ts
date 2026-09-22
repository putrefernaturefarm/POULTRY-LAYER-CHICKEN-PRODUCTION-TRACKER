// ============================================================
// LayerPro — Centralized Poultry Production Calculations
// All formulas are documented here. Sources are industry-standard
// poultry management references (North & Bell, NRC, FAO).
// ============================================================

/** Hen-Day Egg Production % — most common layer performance metric */
export function henDayProduction(totalEggs: number, hensPresent: number): number {
  if (hensPresent <= 0) return 0
  return (totalEggs / hensPresent) * 100
}

/** Eggs per hen per day */
export function eggsPerHen(totalEggs: number, hensPresent: number): number {
  if (hensPresent <= 0) return 0
  return totalEggs / hensPresent
}

/** Egg loss percentage */
export function eggLossPct(totalEggs: number, goodEggs: number): number {
  if (totalEggs <= 0) return 0
  return ((totalEggs - goodEggs) / totalEggs) * 100
}

/** Good egg percentage */
export function goodEggPct(goodEggs: number, totalEggs: number): number {
  if (totalEggs <= 0) return 0
  return (goodEggs / totalEggs) * 100
}

/** Morbidity Rate — proportion of flock showing illness signs */
export function morbidityRate(numAffected: number, populationAtRisk: number): number {
  if (populationAtRisk <= 0) return 0
  return (numAffected / populationAtRisk) * 100
}

/** Mortality Rate — proportion of flock that died */
export function mortalityRate(numDeaths: number, populationAtRisk: number): number {
  if (populationAtRisk <= 0) return 0
  return (numDeaths / populationAtRisk) * 100
}

/** Feed consumed per hen per day (grams) */
export function feedPerHenGrams(amountKg: number, hensPresent: number): number {
  if (hensPresent <= 0) return 0
  return (amountKg * 1000) / hensPresent
}

/** Feed cost per egg */
export function feedCostPerEgg(totalFeedCost: number, totalEggs: number): number {
  if (totalEggs <= 0) return 0
  return totalFeedCost / totalEggs
}

/** Feed cost per dozen */
export function feedCostPerDozen(totalFeedCost: number, totalEggs: number): number {
  if (totalEggs <= 0) return 0
  return (totalFeedCost / totalEggs) * 12
}

/** Feed conversion ratio for layers — not standard but useful for cost analysis */
export function feedConversionRatio(feedConsumedKg: number, eggsMassKg: number): number {
  if (eggsMassKg <= 0) return 0
  return feedConsumedKg / eggsMassKg
}

/** Water per bird (liters) */
export function waterPerBird(totalLiters: number, hensPresent: number): number {
  if (hensPresent <= 0) return 0
  return totalLiters / hensPresent
}

/** Ending population */
export function endingPopulation(
  beginning: number,
  additions: number,
  mortality: number,
  culling: number,
  soldTransferred: number
): number {
  return Math.max(0, beginning + additions - mortality - culling - soldTransferred)
}

/** Cost per egg (total expenses / total eggs) */
export function costPerEgg(totalExpenses: number, totalEggs: number): number {
  if (totalEggs <= 0) return 0
  return totalExpenses / totalEggs
}

/** Cost per dozen */
export function costPerDozen(totalExpenses: number, totalEggs: number): number {
  if (totalEggs <= 0) return 0
  return (totalExpenses / totalEggs) * 12
}

/** Cost per bird */
export function costPerBird(totalExpenses: number, population: number): number {
  if (population <= 0) return 0
  return totalExpenses / population
}

/** Gross margin */
export function grossMargin(totalRevenue: number, totalExpenses: number): number {
  return totalRevenue - totalExpenses
}

/** Gross margin percentage */
export function grossMarginPct(totalRevenue: number, totalExpenses: number): number {
  if (totalRevenue <= 0) return 0
  return ((totalRevenue - totalExpenses) / totalRevenue) * 100
}

/** Flock age in weeks from date received */
export function flockAgeWeeks(dateReceived: Date, asOf?: Date): number {
  const ref = asOf ?? new Date()
  const ms = ref.getTime() - dateReceived.getTime()
  return Math.floor(ms / (7 * 24 * 60 * 60 * 1000))
}

/** Cumulative mortality rate over a period */
export function cumulativeMortalityRate(totalDeaths: number, initialPop: number): number {
  if (initialPop <= 0) return 0
  return (totalDeaths / initialPop) * 100
}

/** Cumulative morbidity rate over a period */
export function cumulativeMorbidityRate(totalAffected: number, initialPop: number): number {
  if (initialPop <= 0) return 0
  return (totalAffected / initialPop) * 100
}

// Formatting helpers
export function formatPct(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(value)
}
