'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import styles from './page.module.css'

type FilterType = 'all' | 'pending' | 'approved' | 'rejected'

type RelatedBlog =
  | {
      title: string | null
      slug: string | null
    }
  | null

type CommentItem = {
  id: string
  blog_id: string
  author_name: string
  content: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string | null
  approved_at: string | null
  blogs?: RelatedBlog | RelatedBlog[]
}

function getBlogInfo(comment: CommentItem): RelatedBlog {
  if (Array.isArray(comment.blogs)) {
    return comment.blogs[0] || null
  }
  return comment.blogs || null
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<CommentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')

  const fetchComments = async () => {
    setLoading(true)
    setMessage('')

    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          blog_id,
          author_name,
          content,
          status,
          created_at,
          approved_at,
          blogs (
            title,
            slug
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setComments((data || []) as CommentItem[])
    } catch (error) {
      console.error('fetchComments error:', error)
      setMessage('โหลดคอมเมนต์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [])

  const counts = useMemo(() => {
    return {
      all: comments.length,
      pending: comments.filter((c) => c.status === 'pending').length,
      approved: comments.filter((c) => c.status === 'approved').length,
      rejected: comments.filter((c) => c.status === 'rejected').length,
    }
  }, [comments])

  const filteredComments = useMemo(() => {
    if (filter === 'all') return comments
    return comments.filter((comment) => comment.status === filter)
  }, [comments, filter])

  const handleUpdateStatus = async (
    comment: CommentItem,
    nextStatus: 'approved' | 'rejected'
  ) => {
    setMessage('')

    const payload =
      nextStatus === 'approved'
        ? {
            status: 'approved' as const,
            approved_at: new Date().toISOString(),
          }
        : {
            status: 'rejected' as const,
            approved_at: null,
          }

    const { error } = await supabase
      .from('comments')
      .update(payload)
      .eq('id', comment.id)

    if (error) {
      setMessage('อัปเดตสถานะคอมเมนต์ไม่สำเร็จ')
      return
    }

    setComments((prev) =>
      prev.map((item) =>
        item.id === comment.id ? { ...item, ...payload } : item
      )
    )

    setMessage(
      nextStatus === 'approved'
        ? 'อนุมัติคอมเมนต์สำเร็จ'
        : 'ปฏิเสธคอมเมนต์สำเร็จ'
    )
  }

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Admin Comments</h1>
          <p className={styles.subtitle}>
            จัดการคอมเมนต์ทั้งหมด แยกตามสถานะ และตรวจสอบได้ง่ายขึ้น
          </p>
        </div>

        <div className={styles.actions}>
          <button onClick={fetchComments} type="button" className={styles.deleteButton}>
            โหลดใหม่
          </button>

          <a href="/admin/blogs" className={styles.linkButton}>
            ไปหน้า Admin Blogs
          </a>
        </div>
      </div>

      {message && <p className={styles.message}>{message}</p>}

      <div className={styles.filterBar}>
        <button
          type="button"
          className={`${styles.filterButton} ${
            filter === 'all' ? styles.filterButtonActive : ''
          }`}
          onClick={() => setFilter('all')}
        >
          ทั้งหมด ({counts.all})
        </button>

        <button
          type="button"
          className={`${styles.filterButton} ${
            filter === 'pending' ? styles.filterButtonActive : ''
          }`}
          onClick={() => setFilter('pending')}
        >
          Pending ({counts.pending})
        </button>

        <button
          type="button"
          className={`${styles.filterButton} ${
            filter === 'approved' ? styles.filterButtonActive : ''
          }`}
          onClick={() => setFilter('approved')}
        >
          Approved ({counts.approved})
        </button>

        <button
          type="button"
          className={`${styles.filterButton} ${
            filter === 'rejected' ? styles.filterButtonActive : ''
          }`}
          onClick={() => setFilter('rejected')}
        >
          Rejected ({counts.rejected})
        </button>
      </div>

      {loading ? (
        <p className={styles.empty}>กำลังโหลด...</p>
      ) : !filteredComments.length ? (
        <p className={styles.empty}>ยังไม่มีคอมเมนต์ในหมวดนี้</p>
      ) : (
        <div className={styles.grid}>
          {filteredComments.map((comment) => {
            const blog = getBlogInfo(comment)

            return (
              <article key={comment.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <span
                    className={`${styles.statusBadge} ${
                      comment.status === 'approved'
                        ? styles.statusApproved
                        : comment.status === 'rejected'
                        ? styles.statusRejected
                        : styles.statusPending
                    }`}
                  >
                    {comment.status}
                  </span>
                </div>

                <h2 className={styles.blogTitle}>
                  {blog?.title || 'ไม่พบบทความที่เกี่ยวข้อง'}
                </h2>

                <div className={styles.metaList}>
                  <p>
                    <strong>ผู้ส่ง:</strong> {comment.author_name}
                  </p>
                  <p>
                    <strong>เวลา:</strong>{' '}
                    {comment.created_at
                      ? new Date(comment.created_at).toLocaleString('th-TH')
                      : '-'}
                  </p>
                  <p>
                    <strong>blog_id:</strong> {comment.blog_id}
                  </p>
                </div>

                <div className={styles.contentBox}>{comment.content}</div>

                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.button}
                    onClick={() => handleUpdateStatus(comment, 'approved')}
                  >
                    Approve
                  </button>

                  <button
                    type="button"
                    className={styles.deleteButton}
                    onClick={() => handleUpdateStatus(comment, 'rejected')}
                  >
                    Reject
                  </button>

                  {blog?.slug && (
                    <a
                      href={`/blog/${blog.slug}`}
                      target="_blank"
                      className={styles.linkButton}
                    >
                      ดูหน้าบทความ
                    </a>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </main>
  )
}