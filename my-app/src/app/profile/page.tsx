'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export default function ProfilePage() {
  const router = useRouter()
  // 把 useSession 作为 Hook 在组件顶层调用（不能在 useEffect 内调用）
  const { data, error: authError } = (authClient as any).useSession?.() ?? {
    data: null,
    error: null,
  }

  const [email, setEmail] = useState<string | null>(null)
  const [name, setName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        if (authError && mounted) {
          setError(authError?.message ?? String(authError))
        }
        // 兼容返回格式： data: { user } 或 data: { session: { user } }
        const u = data?.user ?? data?.session?.user ?? data?.user?.value ?? null
        const maybeEmail = u?.email ?? u?.email ?? null
        console.log(maybeEmail)
        if (mounted) {
          setEmail(maybeEmail ?? null)
          setName(u?.name ?? null)
          if (!maybeEmail && authError) setError('未登录或无法获取用户信息')
        }
      } catch (err: any) {
        if (mounted) setError(err?.message ?? String(err))
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
    // 监听 data 和 authError 的变化
  }, [data, authError])

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      ;(await (authClient as any).signOut?.()) ?? (authClient as any).logout?.()
      router.push('/login')
    } catch (err) {
      setError((err as any)?.message ?? String(err))
    } finally {
      setSigningOut(false)
    }
  }

  if (loading) return <div style={{ padding: 16 }}>加载中...</div>

  return (
    <div style={{ padding: 24, maxWidth: 480, margin: '0 auto' }}>
      <h1>用户信息</h1>
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      <div style={{ marginBottom: 12 }}>
        <strong>用户名:</strong> {name ?? 'loading...'}
      </div>
      <div style={{ marginBottom: 12 }}>
        <strong>邮箱：</strong> {email ?? 'loading...'}
      </div>
      <button onClick={handleSignOut} disabled={signingOut} style={{ padding: '0.5rem 1rem' }}>
        {signingOut ? '退出中...' : '退出登录'}
      </button>
    </div>
  )
}
