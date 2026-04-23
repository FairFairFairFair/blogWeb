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
  if (typeof window === 'undefined') return null

  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as CachedNavbarState
  } catch {
    return null
  }
}

function writeCache(data: CachedNavbarState) {
  if (typeof window === 'undefined') return

  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data))
  } catch {}
}

function clearCache() {
  if (typeof window === 'undefined') return

  try {
    sessionStorage.removeItem(CACHE_KEY)
  } catch {}
}

export default function AppNavbar() {
  const router = useRouter()

  const [hydrated, setHydrated] = useState(false)
  const [role, setRole] = useState<UserRole>(null)
  const [email, setEmail] = useState('')

  useEffect(() => {
    let isMounted = true

    const applySession = async () => {
      const cached = readCache()

      if (cached && isMounted) {
        setEmail(cached.email || '')
        setRole(cached.role || 'user')
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!isMounted) return

      if (!session) {
        setRole(null)
        setEmail('')
        clearCache()
        setHydrated(true)
        return
      }

      const nextEmail = session.user.email || ''

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle()

      if (!isMounted) return

      const nextRole = (profile?.role as UserRole) || 'user'

      setEmail(nextEmail)
      setRole(nextRole)
      writeCache({
        email: nextEmail,
        role: nextRole,
      })
      setHydrated(true)
    }

    applySession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        setRole(null)
        setEmail('')
        clearCache()
        setHydrated(true)
        return
      }

      const nextEmail = session.user.email || ''

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle()

      const nextRole = (profile?.role as UserRole) || 'user'

      setEmail(nextEmail)
      setRole(nextRole)
      writeCache({
        email: nextEmail,
        role: nextRole,
      })
      setHydrated(true)
    })

    return () => {
      isMounted = false
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
          <Link href="/" className={styles.brand}>
            BlogWeb
          </Link>

          <div className={styles.links}>
            <Link href="/" className={styles.link}>
              Home
            </Link>

            {hydrated && role === 'admin' && (
              <>
                <Link href="/admin/blogs" className={styles.link}>
                  Admin Blogs
                </Link>
                <Link href="/admin/comments" className={styles.link}>
                  Admin Comments
                </Link>
              </>
            )}
          </div>
        </div>

        <div className={styles.right}>
          {!hydrated ? (
            <div style={{ width: 160, height: 24 }} />
          ) : email ? (
            <>
              <span className={styles.email}>{email}</span>
              <button onClick={handleLogout} className={styles.logoutButton}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={styles.link}>
                Login
              </Link>
              <Link href="/register" className={styles.link}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}