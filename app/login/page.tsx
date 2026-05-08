'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async () => {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#0a0a0a', fontFamily: 'sans-serif'
    }}>
      <div style={{
        width: 360, padding: 32, background: '#111', borderRadius: 8,
        border: '1px solid #2a2a2a', display: 'flex', flexDirection: 'column', gap: 16
      }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#c8f542', letterSpacing: 1 }}>
            CLASSIC PHYSIQUE
          </div>
          <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
            Training log. Golden era focus.
          </div>
        </div>

        {error && (
          <div style={{ fontSize: 13, color: '#f87171', background: '#2d0000',
            border: '1px solid #f87171', borderRadius: 4, padding: '8px 12px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{
              background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 4,
              padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none'
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{
              background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 4,
              padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none'
            }}
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading || !email || !password}
          style={{
            background: loading ? '#1a1a1a' : '#c8f542', color: '#000',
            border: 'none', borderRadius: 4, padding: '11px 0',
            fontSize: 14, fontWeight: 700, cursor: loading ? 'default' : 'pointer',
            opacity: loading || !email || !password ? 0.5 : 1,
            letterSpacing: 1
          }}
        >
          {loading ? 'SIGNING IN...' : 'SIGN IN'}
        </button>
      </div>
    </div>
  )
}