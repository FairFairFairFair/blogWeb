import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import CommentForm from '@/components/CommentForm'
import styles from './page.module.css'

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

export default async function BlogDetail({ params }: PageProps) {
  const { slug } = await params

  const { data: blog, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error || !blog) {
    return (
      <main className={styles.wrapper}>
        <Link href="/" className={styles.backLink}>
          ← กลับหน้าแรก
        </Link>

        <section className={styles.contentCard}>
          <h1 className={styles.title}>ไม่พบบทความ</h1>
          <p className={styles.empty}>บทความนี้อาจถูกลบ หรือยังไม่ได้ publish</p>
        </section>
      </main>
    )
  }

  const nextViewCount = (blog.view_count || 0) + 1

  const { error: viewCountError } = await supabase.rpc(
    'increment_blog_view_count',
    {
      p_blog_id: blog.id,
    }
  )

  if (viewCountError) {
    console.error('increment view count error:', viewCountError)
  }

  const { data: images } = await supabase
    .from('blog_images')
    .select('*')
    .eq('blog_id', blog.id)
    .order('sort_order', { ascending: true })
    .limit(6)

  const { data: comments } = await supabase
    .from('comments')
    .select('*')
    .eq('blog_id', blog.id)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  return (
    <main className={styles.wrapper}>
      <Link href="/" className={styles.backLink}>
        ← กลับหน้าหลัก
      </Link>

      <header className={styles.header}>
        <h1 className={styles.title}>{blog.title}</h1>

        <div className={styles.metaRow}>
          {blog.published_at && (
            <span>
              วันที่โพสต์: {new Date(blog.published_at).toLocaleDateString('th-TH')}
            </span>
          )}
          <span>ผู้เข้าชม: {nextViewCount}</span>
        </div>
      </header>

      {blog.cover_image_url && (
        <img
          src={blog.cover_image_url}
          alt={blog.title}
          className={styles.cover}
        />
      )}

      <section className={styles.contentCard}>
        <div className={styles.content}>{blog.content}</div>

        {!!images?.length && (
          <div className={styles.gallery}>
            <h2 className={styles.galleryTitle}>รูปภาพเพิ่มเติม</h2>

            <div className={styles.galleryGrid}>
              {images.map((img) => (
                <img
                  key={img.id}
                  src={img.image_url}
                  alt="blog image"
                  className={styles.galleryImage}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      <section className={styles.commentsSection}>
        <h2 className={styles.sectionTitle}>ความคิดเห็น</h2>

        {!comments?.length ? (
          <p className={styles.empty}>ยังไม่มีคอมเมนต์</p>
        ) : (
          <div className={styles.commentsList}>
            {comments.map((comment) => (
              <div key={comment.id} className={styles.commentCard}>
                <div className={styles.commentName}>{comment.author_name}</div>
                <div className={styles.commentText}>{comment.content}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={styles.formCard}>
        <CommentForm blogId={blog.id} />
      </section>
    </main>
  )
}