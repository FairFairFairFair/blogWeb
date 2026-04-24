'use client'

import { useEffect } from 'react'
import AppNavbar from '@/components/AppNavbar'
import { useAuth } from '@/components/AuthProvider'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { loading, role, isLoggedIn } = useAuth()

  useEffect(() => {
    if (loading) return

    if (!isLoggedIn) {
      window.location.replace('/login')
      return
    }

    if (role !== 'admin') {
      window.location.replace('/')
    }
  }, [loading, isLoggedIn, role])

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

  if (!isLoggedIn || role !== 'admin') {
    return null
  }

  return (
    <>
      <AppNavbar />
      {children}
    </>
  )
}