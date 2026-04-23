'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import styles from './CommentForm.module.css'

export default function CommentForm({ blogId }: { blogId: string }) {
  const [authorName, setAuthorName] = useState('')
  const [content, setContent] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const thaiNumberRegex = /^[ก-๙0-9\s]+$/

    if (!authorName.trim()) {
      setMessage('กรุณากรอกชื่อผู้ส่ง')
      return
    }

    if (!content.trim()) {
      setMessage('กรุณากรอกข้อความ')
      return
    }

    if (!thaiNumberRegex.test(content.trim())) {
      setMessage('ข้อความต้องเป็นภาษาไทยและตัวเลขเท่านั้น')
      return
    }

    const { error } = await supabase.from('comments').insert([
      {
        blog_id: blogId,
        author_name: authorName,
        content,
        status: 'pending',
      },
    ])

    if (error) {
      setMessage('ส่งคอมเมนต์ไม่สำเร็จ')
      return
    }

    setMessage('ส่งคอมเมนต์สำเร็จ รอการอนุมัติจาก admin')
    setAuthorName('')
    setContent('')
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h3 className={styles.heading}>แสดงความคิดเห็น</h3>

      <input
        type="text"
        placeholder="ชื่อผู้ส่ง"
        value={authorName}
        onChange={(e) => setAuthorName(e.target.value)}
        className={styles.input}
      />

      <textarea
        placeholder="ข้อความ"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className={styles.textarea}
      />

      <button type="submit" className={styles.button}>
        ส่งคอมเมนต์
      </button>

      {message && <p className={styles.message}>{message}</p>}
    </form>
  )
}