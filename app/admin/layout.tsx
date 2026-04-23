'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AppNavbar from '@/components/AppNavbar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.replace('/login')
        return
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (error || !profile || profile.role !== 'admin') {
        router.replace('/')
        return
      }

      setLoading(false)
    }

    checkAdmin()
  }, [router])

  if (loading) {
    return (
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
        <p>กำลังตรวจสอบสิทธิ์ admin...</p>
      </main>
    )
  }

  return (
    <>
      <AppNavbar />
      {children}
    </>
  )
}