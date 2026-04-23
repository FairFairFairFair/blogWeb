'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import styles from './AppNavbar.module.css'

type UserRole = 'admin' | 'user' | null

const CACHE_KEY = 'blogweb-navbar-session'

type CachedNavbarState = {
  email: string
  role: UserRole
}

function readCache(): CachedNavbarState | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as CachedNavbarState
  } catch {
    return null
  }
}

function writeCache(data: CachedNavbarState) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data))
  } catch {}
}

function clearCache() {
  try {
    sessionStorage.removeItem(CACHE_KEY)
  } catch {}
}

export default function AppNavbar() {
  const router = useRouter()

  const cached =
    typeof window !== 'undefined' ? readCache() : null

  const [role, setRole] = useState<UserRole>(cached?.role ?? null)
  const [email, setEmail] = useState(cached?.email ?? '')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const loadProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!mounted) return

      if (!session) {
        setRole(null)
        setEmail('')
        clearCache()
        setLoading(false)
        return
      }

      const nextEmail = session.user.email || ''

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle()

      if (!mounted) return

      const nextRole = (profile?.role as UserRole) || 'user'

      setEmail(nextEmail)
      setRole(nextRole)
      writeCache({
        email: nextEmail,
        role: nextRole,
      })
      setLoading(false)
    }

    loadProfile()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return

      if (!session) {
        setRole(null)
        setEmail('')
        clearCache()
        setLoading(false)
        return
      }

      const nextEmail = session.user.email || ''

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle()

      if (!mounted) return

      const nextRole = (profile?.role as UserRole) || 'user'

      setEmail(nextEmail)
      setRole(nextRole)
      writeCache({
        email: nextEmail,
        role: nextRole,
      })
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    clearCache()
    setRole(null)
    setEmail('')
    router.replace('/')
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <Link href="/" prefetch={false} className={styles.brand}>
            BlogWeb
          </Link>

          <div className={styles.links}>
            <Link href="/" prefetch={false} className={styles.link}>
              Home
            </Link>

            {role === 'admin' && (
              <>
                <Link href="/admin/blogs" prefetch={false} className={styles.link}>
                  Admin Blogs
                </Link>
                <Link href="/admin/comments" prefetch={false} className={styles.link}>
                  Admin Comments
                </Link>
              </>
            )}
          </div>
        </div>

        <div className={styles.right}>
          {loading ? (
            <>
              <Link href="/login" prefetch={false} className={styles.link}>
                Login
              </Link>
              <Link href="/register" prefetch={false} className={styles.link}>
                Register
              </Link>
            </>
          ) : email ? (
            <>
              <span className={styles.email}>{email}</span>
              <button onClick={handleLogout} className={styles.logoutButton}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" prefetch={false} className={styles.link}>
                Login
              </Link>
              <Link href="/register" prefetch={false} className={styles.link}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}