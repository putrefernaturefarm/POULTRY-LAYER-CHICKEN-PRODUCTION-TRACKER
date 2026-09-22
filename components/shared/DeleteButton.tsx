'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'

interface Props {
  action: () => Promise<{ error?: string } | void>
  label?: string
}

export default function DeleteButton({ action, label = 'record' }: Props) {
  const [pending, start] = useTransition()

  function handleClick() {
    if (!confirm(`Delete this ${label}? This cannot be undone.`)) return
    start(async () => {
      const result = await action()
      if (result && 'error' in result && result.error) {
        toast.error(result.error)
      } else {
        toast.success(`${label.charAt(0).toUpperCase() + label.slice(1)} deleted.`)
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="text-xs font-medium flex items-center gap-1 transition-colors"
      style={{ color: pending ? 'var(--ink-muted)' : 'var(--red)', cursor: pending ? 'wait' : 'pointer' }}
      title={`Delete ${label}`}
    >
      <Trash2 size={11} />
      {pending ? '…' : 'Del'}
    </button>
  )
}
