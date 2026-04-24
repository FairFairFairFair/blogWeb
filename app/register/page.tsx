'use client'

import Link from 'next/link'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import styles from './page.module.css'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    setMessage('')
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        if ((error as { status?: number }).status === 429) {
          setMessage('สมัครสมาชิกถี่เกินไป กรุณารอสักครู่แล้วลองใหม่')
        } else {
          setMessage('สมัครสมาชิกไม่สำเร็จ')
        }
        return
      }

      if (data.user && data.session) {
        await supabase.from('profiles').upsert([
          {
            id: data.user.id,
            role: 'user',
          },
        ])

        window.location.assign('/')
        return
      }

      setMessage('สมัครสำเร็จ กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ')
    } catch (error) {
      console.error('register error:', error)
      setMessage('สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Register</h1>

        <form onSubmit={handleRegister} className={styles.form}>
          <input
            type="email"
            placeholder="อีเมล"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            disabled={loading}
            autoComplete="email"
          />

          <input
            type="password"
            placeholder="รหัสผ่าน"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            disabled={loading}
            autoComplete="new-password"
          />

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
          </button>

          {message && <p className={styles.message}>{message}</p>}
        </form>

        <p className={styles.footerText}>
          มีบัญชีแล้ว?{' '}
          <Link href="/login" className={styles.link}>
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </main>
  )
}