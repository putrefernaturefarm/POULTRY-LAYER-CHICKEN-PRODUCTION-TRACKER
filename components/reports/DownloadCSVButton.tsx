'use client'

import { Download } from 'lucide-react'

interface Props {
  data: Record<string, unknown>[]
  filename: string
  label?: string
}

export default function DownloadCSVButton({ data, filename, label = 'Download CSV' }: Props) {
  function handleDownload() {
    if (!data.length) return

    const headers = Object.keys(data[0])
    const rows = data.map(row =>
      headers.map(h => {
        const val = row[h] ?? ''
        const str = String(val)
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str
      }).join(',')
    )

    const csv  = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button onClick={handleDownload} className="btn-ghost flex items-center gap-2 text-sm" disabled={!data.length}>
      <Download size={15} />
      {label}
    </button>
  )
}
