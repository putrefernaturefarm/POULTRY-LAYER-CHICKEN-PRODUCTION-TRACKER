import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, parseISO } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, pattern = 'MMM d, yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, pattern)
}

export function formatDateInput(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'yyyy-MM-dd')
}

export function timeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(value)
}

export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function formatPct(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function safeNumber(val: unknown, fallback = 0): number {
  const n = Number(val)
  return isNaN(n) ? fallback : n
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`)
}

export function severityColor(severity: string): string {
  switch (severity) {
    case 'critical': return 'text-red-600 bg-red-50 border-red-200'
    case 'warning':  return 'text-amber-600 bg-amber-50 border-amber-200'
    default:         return 'text-blue-600 bg-blue-50 border-blue-200'
  }
}

export function statusColor(status: string): string {
  switch (status) {
    case 'active':      return 'text-green-700 bg-green-100'
    case 'completed':   return 'text-blue-700 bg-blue-100'
    case 'culled':      return 'text-orange-700 bg-orange-100'
    case 'sold':        return 'text-purple-700 bg-purple-100'
    case 'transferred': return 'text-gray-700 bg-gray-100'
    default:            return 'text-gray-700 bg-gray-100'
  }
}
