'use client'

import { useEffect, useState } from 'react'
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
    window.location.assign('/')
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <a href="/" className={styles.brand}>
            BlogWeb
          </a>

          <div className={styles.links}>
            <a href="/" className={styles.link}>
              Home
            </a>

            {role === 'admin' && (
              <>
                <a href="/admin/blogs" className={styles.link}>
                  Admin Blogs
                </a>
                <a href="/admin/comments" className={styles.link}>
                  Admin Comments
                </a>
              </>
            )}
          </div>
        </div>

        <div className={styles.right}>
          {loading ? (
            <>
              <a href="/login" className={styles.link}>
                Login
              </a>
              <a href="/register" className={styles.link}>
                Register
              </a>
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
              <a href="/login" className={styles.link}>
                Login
              </a>
              <a href="/register" className={styles.link}>
                Register
              </a>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}