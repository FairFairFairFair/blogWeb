'use client'

import Link from 'next/link'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import styles from './page.module.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    setMessage('')
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error || !data.user) {
        setMessage('เข้าสู่ระบบไม่สำเร็จ')
        return
      }

      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle()

      if (profileError) {
        setMessage('ไม่สามารถตรวจสอบสิทธิ์ผู้ใช้ได้')
        return
      }

      if (!profile) {
        const { error: insertError } = await supabase.from('profiles').insert([
          {
            id: data.user.id,
            role: 'user',
          },
        ])

        if (insertError) {
          setMessage('สร้างโปรไฟล์ผู้ใช้ไม่สำเร็จ')
          return
        }

        profile = { role: 'user' }
      }

      const target = profile.role === 'admin' ? '/admin/blogs' : '/'

      // ใช้ hard redirect จะเสถียรกว่า router.push หลัง auth
      window.location.assign(target)
    } catch (error) {
      console.error('login error:', error)
      setMessage('เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Login</h1>

        <form onSubmit={handleLogin} className={styles.form}>
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
            autoComplete="current-password"
          />

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>

          {message && <p className={styles.message}>{message}</p>}
        </form>

        <p className={styles.footerText}>
          ยังไม่มีบัญชี?{' '}
          <Link href="/register" className={styles.link}>
            สมัครสมาชิก
          </Link>
        </p>
      </div>
    </main>
  )
}