'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import styles from './page.module.css'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setMessage('สมัครสมาชิกไม่สำเร็จ')
      return
    }

    if (data.user && data.session) {
      await supabase.from('profiles').upsert([
        {
          id: data.user.id,
          role: 'user',
        },
      ])

      router.push('/')
      return
    }

    setMessage('สมัครสำเร็จ กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ')
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
          />

          <input
            type="password"
            placeholder="รหัสผ่าน"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
          />

          <button type="submit" className={styles.button}>
            สมัครสมาชิก
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