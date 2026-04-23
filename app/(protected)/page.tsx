import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import styles from './page.module.css'

type SearchParams = Promise<{
  q?: string
  page?: string
}>

type Blog = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_image_url: string | null
  is_published: boolean
  published_at: string | null
}

const PAGE_SIZE = 3

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const q = params?.q?.trim() || ''
  const currentPage = Number(params?.page || '1')
  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let countQuery = supabase
    .from('blogs')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true)

  let dataQuery = supabase
    .from('blogs')
    .select('id, title, slug, excerpt, cover_image_url, is_published, published_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .range(from, to)

  if (q) {
    countQuery = countQuery.ilike('title', `%${q}%`)
    dataQuery = dataQuery.ilike('title', `%${q}%`)
  }

  const [{ count, error: countError }, { data: blogs, error }] = await Promise.all([
    countQuery,
    dataQuery,
  ])

  if (error || countError) {
    return (
      <main className={styles.wrapper}>
        <section className={styles.hero}>
          <p className={styles.badge}>BLOG</p>
          <h1 className={styles.title}>Blog & Updates</h1>
          <p className={styles.subtitle}>โหลดข้อมูลไม่สำเร็จ</p>
        </section>
      </main>
    )
  }

  const totalPages = Math.max(1, Math.ceil((count || 0) / PAGE_SIZE))

  return (
    <main className={styles.wrapper}>
      <section className={styles.hero}>
        <p className={styles.badge}>BLOG</p>
        <h1 className={styles.title}>Stories, updates, and ideas worth reading.</h1>
        <p className={styles.subtitle}>
          รวมบทความ ข่าวสาร และเรื่องราวต่าง ๆ ในรูปแบบที่อ่านง่าย ค้นหาได้ และจัดการได้ผ่านระบบหลังบ้าน
        </p>
      </section>

      <form method="GET" className={styles.searchBar}>
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="ค้นหาชื่อบทความ"
          className={styles.searchInput}
        />
        <button type="submit" className={styles.searchButton}>
          ค้นหา
        </button>
      </form>

      {!blogs?.length ? (
        <p className={styles.empty}>ยังไม่มีบทความ</p>
      ) : (
        <div className={styles.grid}>
          {(blogs as Blog[]).map((blog) => (
            <article key={blog.id} className={styles.card}>
              <div className={styles.imageWrap}>
                {blog.cover_image_url && (
                  <img
                    src={blog.cover_image_url}
                    alt={blog.title}
                    className={styles.image}
                  />
                )}
              </div>

              <div className={styles.cardBody}>
                <h2 className={styles.cardTitle}>{blog.title}</h2>

                {blog.published_at && (
                  <p className={styles.meta}>
                    {new Date(blog.published_at).toLocaleDateString('th-TH')}
                  </p>
                )}

                <p className={styles.excerpt}>{blog.excerpt || 'ยังไม่มีคำอธิบายย่อ'}</p>

                <Link href={`/blog/${blog.slug}`} className={styles.readMore}>
                  อ่านต่อ
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className={styles.pagination}>
        {currentPage > 1 ? (
          <Link
            href={`/?q=${encodeURIComponent(q)}&page=${currentPage - 1}`}
            className={styles.pageButton}
          >
            ← ก่อนหน้า
          </Link>
        ) : (
          <span className={`${styles.pageButton} ${styles.disabled}`}>← ก่อนหน้า</span>
        )}

        <span className={styles.pageInfo}>
          หน้า {currentPage} / {totalPages}
        </span>

        {currentPage < totalPages ? (
          <Link
            href={`/?q=${encodeURIComponent(q)}&page=${currentPage + 1}`}
            className={styles.pageButton}
          >
            ถัดไป →
          </Link>
        ) : (
          <span className={`${styles.pageButton} ${styles.disabled}`}>ถัดไป →</span>
        )}
      </div>
    </main>
  )
}