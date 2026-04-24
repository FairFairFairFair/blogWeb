'use client'

import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import styles from './AppNavbar.module.css'

export default function AppNavbar() {
  const { loading, email, role } = useAuth()

  const handleLogout = async () => {
    await supabase.auth.signOut()
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
          {loading ? null : email ? (
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