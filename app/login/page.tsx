'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import styles from './page.module.css'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

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

    if (profile.role === 'admin') {
      router.push('/admin/blogs')
      return
    }

    router.push('/')
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
          />

          <input
            type="password"
            placeholder="รหัสผ่าน"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
          />

          <button type="submit" className={styles.button}>
            เข้าสู่ระบบ
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