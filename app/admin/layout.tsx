'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import AppNavbar from '@/components/AppNavbar'

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitForSession(maxAttempts = 10, delayMs = 200) {
  for (let i = 0; i < maxAttempts; i++) {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session) return session
    await sleep(delayMs)
  }

  return null
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const checkAdmin = async () => {
      try {
        const session = await waitForSession(10, 200)

        if (cancelled) return

        if (!session) {
          window.location.replace('/login')
          return
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle()

        if (cancelled) return

        if (error || !profile || profile.role !== 'admin') {
          window.location.replace('/')
          return
        }

        setLoading(false)
      } catch (error) {
        console.error('admin layout error:', error)
        if (!cancelled) {
          window.location.replace('/login')
        }
      }
    }

    checkAdmin()

    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <>
        <AppNavbar />
        <main style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
          <p>กำลังตรวจสอบสิทธิ์ admin...</p>
        </main>
      </>
    )
  }

  return (
    <>
      <AppNavbar />
      {children}
    </>
  )
}