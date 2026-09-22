'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [done, setDone]         = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName || !email || !password) { setError('All fields are required.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true); setError('')

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    setDone(true)
    toast.success('Account created! Check your email to confirm.')
  }

  if (done) {
    return (
      <div className="card shadow-float text-center">
        <div className="text-5xl mb-4">📧</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Check your inbox</h2>
        <p className="text-gray-500 text-sm">
          We sent a confirmation email to <strong>{email}</strong>.<br />
          Click the link to activate your account, then sign in.
        </p>
        <Link href="/login" className="btn-primary mt-6 w-full">Go to Sign In</Link>
      </div>
    )
  }

  return (
    <div className="card shadow-float">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Create your account</h2>

      {error && <div className="alert-danger mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>Full name</label>
          <input className="input" type="text" placeholder="Juan dela Cruz"
            value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        <div>
          <label>Email address</label>
          <input className="input" type="email" placeholder="you@example.com"
            value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Password <span className="text-gray-400 font-normal">(min 8 characters)</span></label>
          <input className="input" type="password" placeholder="••••••••"
            value={password} onChange={(e) => setPassword(e.target.value)}
            required minLength={8} />
        </div>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-4">
        Already have an account?{' '}
        <Link href="/login" className="text-farm-green-600 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
