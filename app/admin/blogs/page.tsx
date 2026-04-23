'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import styles from './page.module.css'
import { generateSlug } from '@/lib/generateSlug'
import { uploadImage, deleteImage } from '@/lib/uploadImage'

type BlogItem = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  cover_image_url: string | null
  cover_image_path?: string | null
  cover_image_mode?: 'url' | 'upload'
  is_published: boolean
  published_at: string | null
  view_count: number | null
  created_at: string | null
  updated_at: string | null
}

type BlogImageItem = {
  id: string
  blog_id: string
  image_url: string
  image_path?: string | null
  image_mode?: 'url' | 'upload'
  sort_order: number | null
}

type AdditionalImageInput = {
  mode: 'url' | 'upload'
  url: string
  file: File | null
  existingPath: string | null
  existingMode: 'url' | 'upload' | null
}

type CoverMode = 'url' | 'upload'

const PAGE_SIZE = 6

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<BlogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [imageInputs, setImageInputs] = useState<Record<string, AdditionalImageInput[]>>({})
  const [coverModes, setCoverModes] = useState<Record<string, CoverMode>>({})
  const [coverFiles, setCoverFiles] = useState<Record<string, File | null>>({})
  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const selectedBlog = useMemo(
    () => blogs.find((blog) => blog.id === selectedBlogId) || null,
    [blogs, selectedBlogId]
  )

  const totalPages = Math.max(1, Math.ceil(blogs.length / PAGE_SIZE))

  const paginatedBlogs = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return blogs.slice(start, start + PAGE_SIZE)
  }, [blogs, currentPage])

  const fetchBlogs = async () => {
    setLoading(true)

    const { data: blogData, error: blogError } = await supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false })

    if (blogError) {
      setMessage('โหลดบทความไม่สำเร็จ')
      setLoading(false)
      return
    }

    const blogsResult = (blogData || []) as BlogItem[]
    setBlogs(blogsResult)

    const initialCoverModes: Record<string, CoverMode> = {}
    const initialCoverFiles: Record<string, File | null> = {}

    for (const blog of blogsResult) {
      initialCoverModes[blog.id] =
        blog.cover_image_mode === 'upload' ? 'upload' : 'url'
      initialCoverFiles[blog.id] = null
    }

    setCoverModes(initialCoverModes)
    setCoverFiles(initialCoverFiles)

    const blogIds = blogsResult.map((blog) => blog.id)

    if (blogIds.length === 0) {
      setImageInputs({})
      setLoading(false)
      return
    }

    const { data: imageData, error: imageError } = await supabase
      .from('blog_images')
      .select('*')
      .in('blog_id', blogIds)
      .order('sort_order', { ascending: true })

    if (imageError) {
      setMessage('โหลดรูปเพิ่มเติมไม่สำเร็จ')
      setLoading(false)
      return
    }

    const grouped: Record<string, AdditionalImageInput[]> = {}

    for (const blog of blogsResult) {
      grouped[blog.id] = []
    }

    ;(imageData as BlogImageItem[] | null)?.forEach((img) => {
      if (!grouped[img.blog_id]) grouped[img.blog_id] = []

      grouped[img.blog_id].push({
        mode: img.image_mode === 'upload' ? 'upload' : 'url',
        url: img.image_url || '',
        file: null,
        existingPath: img.image_path ?? null,
        existingMode: img.image_mode === 'upload' ? 'upload' : 'url',
      })
    })

    setImageInputs(grouped)
    setLoading(false)
  }

  useEffect(() => {
    fetchBlogs()
  }, [])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const handleCreate = async () => {
    setMessage('')

    const timestamp = Date.now()
    const title = `บทความใหม่ ${timestamp}`

    const { data, error } = await supabase
      .from('blogs')
      .insert([
        {
          title,
          slug: generateSlug(title),
          excerpt: 'ใส่ excerpt ที่นี่',
          content: 'ใส่เนื้อหาบทความที่นี่',
          cover_image_url:
            'https://images.unsplash.com/photo-1499750310107-5fef28a66643',
          cover_image_mode: 'url',
          cover_image_path: null,
          is_published: false,
          view_count: 0,
        },
      ])
      .select('id')
      .single()

    if (error) {
      setMessage('สร้างบทความไม่สำเร็จ')
      return
    }

    setMessage('สร้างบทความใหม่สำเร็จ')
    await fetchBlogs()
    setCurrentPage(1)
    if (data?.id) {
      setSelectedBlogId(data.id)
    }
  }

  const handleDelete = async (blog: BlogItem) => {
    const confirmed = window.confirm('ต้องการลบบทความนี้ใช่ไหม?')
    if (!confirmed) return

    setMessage('')

    if (blog.cover_image_mode === 'upload' && blog.cover_image_path) {
      try {
        await deleteImage(blog.cover_image_path)
      } catch {
        setMessage('ลบไฟล์รูปปกไม่สำเร็จ')
        return
      }
    }

    const { error: deleteExtraImagesError } = await supabase
      .from('blog_images')
      .delete()
      .eq('blog_id', blog.id)

    if (deleteExtraImagesError) {
      setMessage('ลบรูปเพิ่มเติมไม่สำเร็จ')
      return
    }

    const { error } = await supabase.from('blogs').delete().eq('id', blog.id)

    if (error) {
      setMessage('ลบบทความไม่สำเร็จ')
      return
    }

    if (selectedBlogId === blog.id) {
      setSelectedBlogId(null)
    }

    setMessage('ลบบทความสำเร็จ')
    await fetchBlogs()
    setCurrentPage(1)
  }

  const handleChange = (
    id: string,
    field: keyof BlogItem,
    value: string | boolean | null
  ) => {
    setBlogs((prev) =>
      prev.map((blog) =>
        blog.id === id ? { ...blog, [field]: value } : blog
      )
    )
  }

  const handleAddImageField = (
    blogId: string,
    mode: 'url' | 'upload' = 'url'
  ) => {
    setImageInputs((prev) => {
      const current = prev[blogId] || []
      if (current.length >= 6) return prev

      return {
        ...prev,
        [blogId]: [
          ...current,
          {
            mode,
            url: '',
            file: null,
            existingPath: null,
            existingMode: null,
          },
        ],
      }
    })
  }

  const handleImageModeChange = (
    blogId: string,
    index: number,
    mode: 'url' | 'upload'
  ) => {
    setImageInputs((prev) => {
      const current = [...(prev[blogId] || [])]
      const item = current[index]

      current[index] = {
        ...item,
        mode,
      }

      return {
        ...prev,
        [blogId]: current,
      }
    })
  }

  const handleImageUrlChange = (blogId: string, index: number, value: string) => {
    setImageInputs((prev) => {
      const current = [...(prev[blogId] || [])]
      current[index] = {
        ...current[index],
        url: value,
      }

      return {
        ...prev,
        [blogId]: current,
      }
    })
  }

  const handleImageFileChange = (blogId: string, index: number, file: File | null) => {
    setImageInputs((prev) => {
      const current = [...(prev[blogId] || [])]
      current[index] = {
        ...current[index],
        file,
      }

      return {
        ...prev,
        [blogId]: current,
      }
    })
  }

  const handleRemoveImageField = (blogId: string, index: number) => {
    setImageInputs((prev) => {
      const current = [...(prev[blogId] || [])]
      current.splice(index, 1)

      return {
        ...prev,
        [blogId]: current,
      }
    })
  }

  const handleCoverModeChange = (blogId: string, mode: CoverMode) => {
    setCoverModes((prev) => ({
      ...prev,
      [blogId]: mode,
    }))
  }

  const handleCoverFileChange = (blogId: string, file: File | null) => {
    setCoverFiles((prev) => ({
      ...prev,
      [blogId]: file,
    }))
  }

  const handleSave = async (blog: BlogItem) => {
    setMessage('')

    const additionalImages = imageInputs[blog.id] || []

    if (additionalImages.length > 6) {
      setMessage('รูปเพิ่มเติมได้ไม่เกิน 6 รูป')
      return
    }

    const selectedCoverMode = coverModes[blog.id] || 'url'
    const selectedCoverFile = coverFiles[blog.id]

    let finalCoverImageUrl = blog.cover_image_url?.trim() || null
    let finalCoverImagePath = blog.cover_image_path || null
    let finalCoverImageMode: CoverMode = selectedCoverMode

    if (selectedCoverMode === 'upload') {
      if (selectedCoverFile) {
        try {
          if (blog.cover_image_mode === 'upload' && blog.cover_image_path) {
            await deleteImage(blog.cover_image_path)
          }

          const uploaded = await uploadImage(
            selectedCoverFile,
            `blogs/${blog.id}/cover`
          )

          finalCoverImageUrl = uploaded.url
          finalCoverImagePath = uploaded.path
          finalCoverImageMode = 'upload'
        } catch {
          setMessage('อัปโหลดรูปปกไม่สำเร็จ')
          return
        }
      } else if (
        !(
          blog.cover_image_mode === 'upload' &&
          blog.cover_image_path &&
          blog.cover_image_url
        )
      ) {
        setMessage('กรุณาเลือกไฟล์รูปปก')
        return
      }
    }

    if (selectedCoverMode === 'url') {
      if (blog.cover_image_mode === 'upload' && blog.cover_image_path) {
        try {
          await deleteImage(blog.cover_image_path)
        } catch {
          setMessage('ลบรูปปกเดิมไม่สำเร็จ')
          return
        }
      }

      finalCoverImageUrl = blog.cover_image_url?.trim() || null
      finalCoverImagePath = null
      finalCoverImageMode = 'url'
    }

    const payload = {
      title: blog.title.trim(),
      slug: generateSlug(blog.slug || blog.title),
      excerpt: blog.excerpt?.trim() || null,
      content: blog.content?.trim() || null,
      cover_image_url: finalCoverImageUrl,
      cover_image_path: finalCoverImagePath,
      cover_image_mode: finalCoverImageMode,
      is_published: blog.is_published,
      published_at: blog.is_published
        ? blog.published_at ?? new Date().toISOString()
        : blog.published_at,
      updated_at: new Date().toISOString(),
    }

    const { error: blogError } = await supabase
      .from('blogs')
      .update(payload)
      .eq('id', blog.id)

    if (blogError) {
      setMessage('บันทึกบทความไม่สำเร็จ')
      return
    }

    const finalAdditionalRows: {
      blog_id: string
      image_url: string
      image_path: string | null
      image_mode: 'url' | 'upload'
      sort_order: number
    }[] = []

    for (const item of additionalImages) {
      if (item.mode === 'url') {
        const url = item.url.trim()
        if (!url) continue

        finalAdditionalRows.push({
          blog_id: blog.id,
          image_url: url,
          image_path: null,
          image_mode: 'url',
          sort_order: finalAdditionalRows.length + 1,
        })
      } else {
        if (item.file) {
          try {
            const uploaded = await uploadImage(item.file, `blogs/${blog.id}/additional`)

            finalAdditionalRows.push({
              blog_id: blog.id,
              image_url: uploaded.url,
              image_path: uploaded.path,
              image_mode: 'upload',
              sort_order: finalAdditionalRows.length + 1,
            })
          } catch {
            setMessage('อัปโหลดรูปเพิ่มเติมไม่สำเร็จ')
            return
          }
        } else if (item.existingPath && item.url) {
          finalAdditionalRows.push({
            blog_id: blog.id,
            image_url: item.url,
            image_path: item.existingPath,
            image_mode: 'upload',
            sort_order: finalAdditionalRows.length + 1,
          })
        }
      }
    }

    const oldUploadPaths = additionalImages
      .filter((item) => item.existingMode === 'upload' && item.existingPath)
      .map((item) => item.existingPath as string)

    const keptUploadPaths = new Set(
      finalAdditionalRows
        .filter((row) => row.image_mode === 'upload' && row.image_path)
        .map((row) => row.image_path as string)
    )

    for (const oldPath of oldUploadPaths) {
      if (!keptUploadPaths.has(oldPath)) {
        try {
          await deleteImage(oldPath)
        } catch {
          setMessage('ลบรูปเพิ่มเติมเดิมไม่สำเร็จ')
          return
        }
      }
    }

    const { error: deleteImageError } = await supabase
      .from('blog_images')
      .delete()
      .eq('blog_id', blog.id)

    if (deleteImageError) {
      setMessage('บันทึกรูปเพิ่มเติมไม่สำเร็จ')
      return
    }

    if (finalAdditionalRows.length > 0) {
      const { error: insertImageError } = await supabase
        .from('blog_images')
        .insert(finalAdditionalRows)

      if (insertImageError) {
        setMessage('บันทึกรูปเพิ่มเติมไม่สำเร็จ')
        return
      }
    }

    setMessage('บันทึกบทความสำเร็จ')
    await fetchBlogs()
    setSelectedBlogId(blog.id)
  }

    const previewAdditionalImages = selectedBlog
    ? (imageInputs[selectedBlog.id] || [])
        .filter((item) => item.url?.trim())
        .slice(0, 6)
    : []

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Admin Blogs</h1>
          <p className={styles.subtitle}>จัดการบทความได้ง่ายขึ้นผ่านมุมมองแบบการ์ด</p>
        </div>

        <button onClick={handleCreate} className={styles.button}>
          สร้างบทความใหม่
        </button>
      </div>

      {message && <p className={styles.message}>{message}</p>}

      {loading ? (
        <p className={styles.empty}>กำลังโหลด...</p>
      ) : !blogs.length ? (
        <p className={styles.empty}>ยังไม่มีบทความ</p>
      ) : (
        <>
          <div className={styles.blogGrid}>
            {paginatedBlogs.map((blog) => (
              <article key={blog.id} className={styles.summaryCard}>
                <div className={styles.summaryImageWrap}>
                  {blog.cover_image_url ? (
                    <img
                      src={blog.cover_image_url}
                      alt={blog.title}
                      className={styles.summaryImage}
                    />
                  ) : (
                    <div className={styles.summaryImagePlaceholder}>No image</div>
                  )}
                </div>

                <div className={styles.summaryContent}>
                  <div className={styles.summaryTop}>
                    <span
                      className={`${styles.statusBadge} ${
                        blog.is_published ? styles.statusPublished : styles.statusDraft
                      }`}
                    >
                      {blog.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  <h2 className={styles.summaryTitle}>{blog.title}</h2>

                  <p className={styles.summaryMeta}>
                    slug: {blog.slug}
                  </p>

                  <p className={styles.summaryMeta}>
                    วันที่โพสต์:{' '}
                    {blog.published_at
                      ? new Date(blog.published_at).toLocaleDateString('th-TH')
                      : '-'}
                  </p>

                  <p className={styles.summaryMeta}>ผู้เข้าชม: {blog.view_count || 0}</p>

                  <p className={styles.summaryExcerpt}>
                    {blog.excerpt || 'ยังไม่มี excerpt'}
                  </p>

                  <div className={styles.summaryActions}>
                    <button
                      type="button"
                      className={styles.button}
                      onClick={() => setSelectedBlogId(blog.id)}
                    >
                      แก้ไข
                    </button>

                    <button
                      type="button"
                      className={styles.deleteButton}
                      onClick={() => handleDelete(blog)}
                    >
                      ลบ
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className={styles.pagination}>
            <button
              type="button"
              className={styles.pageButton}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            >
              ← ก่อนหน้า
            </button>

            <span className={styles.pageInfo}>
              หน้า {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              className={styles.pageButton}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            >
              ถัดไป →
            </button>
          </div>
        </>
      )}

      {selectedBlog && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedBlogId(null)}
        >
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>แก้ไขบทความ</h2>
                <p className={styles.modalSubtitle}>{selectedBlog.title}</p>
              </div>

              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setSelectedBlogId(null)}
              >
                ปิด
              </button>
            </div>

            <div className={styles.modalLayout}>
              <div className={styles.editorPane}>
                <div className={styles.grid}>
                  <div>
                    <label className={styles.label}>ชื่อบทความ</label>
                    <input
                      className={styles.input}
                      value={selectedBlog.title || ''}
                      onChange={(e) =>
                        handleChange(selectedBlog.id, 'title', e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className={styles.label}>Slug</label>
                    <input
                      className={styles.input}
                      value={selectedBlog.slug || ''}
                      onChange={(e) =>
                        handleChange(selectedBlog.id, 'slug', e.target.value)
                      }
                    />
                  </div>

                  <div className={styles.fullWidth}>
                    <label className={styles.label}>Excerpt</label>
                    <textarea
                      className={styles.textarea}
                      value={selectedBlog.excerpt || ''}
                      onChange={(e) =>
                        handleChange(selectedBlog.id, 'excerpt', e.target.value)
                      }
                    />
                  </div>

                  <div className={styles.fullWidth}>
                    <label className={styles.label}>Content</label>
                    <textarea
                      className={`${styles.textarea} ${styles.largeTextarea}`}
                      value={selectedBlog.content || ''}
                      onChange={(e) =>
                        handleChange(selectedBlog.id, 'content', e.target.value)
                      }
                    />
                  </div>

                  <div className={styles.fullWidth}>
                    <label className={styles.label}>รูปปก</label>

                    <div className={styles.modeRow}>
                      <label className={styles.radioLabel}>
                        <input
                          type="radio"
                          name={`cover-mode-${selectedBlog.id}`}
                          checked={(coverModes[selectedBlog.id] || 'url') === 'url'}
                          onChange={() => handleCoverModeChange(selectedBlog.id, 'url')}
                        />
                        <span>ใช้ลิงก์</span>
                      </label>

                      <label className={styles.radioLabel}>
                        <input
                          type="radio"
                          name={`cover-mode-${selectedBlog.id}`}
                          checked={(coverModes[selectedBlog.id] || 'url') === 'upload'}
                          onChange={() => handleCoverModeChange(selectedBlog.id, 'upload')}
                        />
                        <span>อัปโหลดไฟล์</span>
                      </label>
                    </div>

                    {(coverModes[selectedBlog.id] || 'url') === 'url' ? (
                      <input
                        key={`cover-url-${selectedBlog.id}`}
                        type="text"
                        className={styles.input}
                        value={selectedBlog.cover_image_url ?? ''}
                        onChange={(e) =>
                          handleChange(selectedBlog.id, 'cover_image_url', e.target.value)
                        }
                        placeholder="ใส่ URL รูปปก"
                      />
                    ) : (
                      <input
                        key={`cover-file-${selectedBlog.id}`}
                        className={styles.input}
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleCoverFileChange(selectedBlog.id, e.target.files?.[0] || null)
                        }
                      />
                    )}

                    {selectedBlog.cover_image_url && (
                      <img
                        src={selectedBlog.cover_image_url}
                        alt="cover preview"
                        className={styles.previewImage}
                      />
                    )}
                  </div>

                  <div className={styles.fullWidth}>
                    <label className={styles.label}>รูปเพิ่มเติม (ไม่เกิน 6 รูป)</label>

                    <div className={styles.imageList}>
                      {(imageInputs[selectedBlog.id] || []).map((item, index) => (
                        <div key={index} className={styles.additionalImageCard}>
                          <div className={styles.modeRow}>
                            <label className={styles.radioLabel}>
                              <input
                                type="radio"
                                name={`additional-mode-${selectedBlog.id}-${index}`}
                                checked={item.mode === 'url'}
                                onChange={() =>
                                  handleImageModeChange(selectedBlog.id, index, 'url')
                                }
                              />
                              <span>ใช้ลิงก์</span>
                            </label>

                            <label className={styles.radioLabel}>
                              <input
                                type="radio"
                                name={`additional-mode-${selectedBlog.id}-${index}`}
                                checked={item.mode === 'upload'}
                                onChange={() =>
                                  handleImageModeChange(selectedBlog.id, index, 'upload')
                                }
                              />
                              <span>อัปโหลดไฟล์</span>
                            </label>
                          </div>

                          {item.mode === 'url' ? (
                            <input
                              key={`additional-url-${selectedBlog.id}-${index}`}
                              type="text"
                              className={styles.input}
                              value={item.url ?? ''}
                              placeholder={`Additional image URL ${index + 1}`}
                              onChange={(e) =>
                                handleImageUrlChange(selectedBlog.id, index, e.target.value)
                              }
                            />
                          ) : (
                            <input
                              key={`additional-file-${selectedBlog.id}-${index}`}
                              className={styles.input}
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleImageFileChange(
                                  selectedBlog.id,
                                  index,
                                  e.target.files?.[0] || null
                                )
                              }
                            />
                          )}

                          {item.url && (
                            <img
                              src={item.url}
                              alt={`additional preview ${index + 1}`}
                              className={styles.previewImage}
                            />
                          )}

                          <button
                            type="button"
                            onClick={() => handleRemoveImageField(selectedBlog.id, index)}
                            className={styles.deleteButton}
                          >
                            ลบรูป
                          </button>
                        </div>
                      ))}
                    </div>

                    {(imageInputs[selectedBlog.id] || []).length < 6 && (
                      <div className={styles.actions}>
                        <button
                          type="button"
                          onClick={() => handleAddImageField(selectedBlog.id, 'url')}
                          className={styles.button}
                        >
                          เพิ่มรูปจากลิงก์
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAddImageField(selectedBlog.id, 'upload')}
                          className={styles.button}
                        >
                          เพิ่มรูปอัปโหลด
                        </button>
                      </div>
                    )}

                    <p className={styles.helpText}>
                      รูปเพิ่มเติมรองรับทั้งแบบลิงก์และอัปโหลดไฟล์
                    </p>
                  </div>

                  <div className={styles.metaBox}>
                    <p>
                      <strong>วันที่โพสต์:</strong>{' '}
                      {selectedBlog.published_at
                        ? new Date(selectedBlog.published_at).toLocaleDateString('th-TH')
                        : '-'}
                    </p>
                    <p>
                      <strong>ผู้เข้าชม:</strong> {selectedBlog.view_count || 0}
                    </p>
                  </div>

                  <div className={styles.publishRow}>
                    <label className={styles.checkboxRow}>
                      <input
                        type="checkbox"
                        checked={selectedBlog.is_published}
                        onChange={(e) =>
                          handleChange(selectedBlog.id, 'is_published', e.target.checked)
                        }
                      />
                      <span>
                        {selectedBlog.is_published ? 'Published' : 'Unpublished'}
                      </span>
                    </label>
                  </div>
                </div>

                <div className={styles.actions}>
                  <button
                    onClick={() => handleSave(selectedBlog)}
                    className={styles.button}
                  >
                    บันทึก
                  </button>

                  <button
                    onClick={() => handleDelete(selectedBlog)}
                    className={styles.deleteButton}
                  >
                    ลบ
                  </button>
                </div>
              </div>

              <aside className={styles.previewPane}>
                <div className={styles.previewCard}>
                  <span
                    className={`${styles.statusBadge} ${
                      selectedBlog.is_published
                        ? styles.statusPublished
                        : styles.statusDraft
                    }`}
                  >
                    {selectedBlog.is_published ? 'Published' : 'Draft'}
                  </span>

                  <h3 className={styles.previewTitle}>
                    {selectedBlog.title || 'ยังไม่มีชื่อบทความ'}
                  </h3>

                  <p className={styles.previewMeta}>slug: {selectedBlog.slug || '-'}</p>

                  <p className={styles.previewMeta}>
                    วันที่โพสต์:{' '}
                    {selectedBlog.published_at
                      ? new Date(selectedBlog.published_at).toLocaleDateString('th-TH')
                      : '-'}
                  </p>

                  <p className={styles.previewMeta}>
                    ผู้เข้าชม: {selectedBlog.view_count || 0}
                  </p>

                  {selectedBlog.cover_image_url ? (
                    <img
                      src={selectedBlog.cover_image_url}
                      alt={selectedBlog.title}
                      className={styles.previewHeroImage}
                    />
                  ) : (
                    <div className={styles.previewPlaceholder}>ไม่มีรูปปก</div>
                  )}

                  <div className={styles.previewSection}>
                    <h4 className={styles.previewSectionTitle}>Excerpt</h4>
                    <p className={styles.previewText}>
                      {selectedBlog.excerpt || 'ยังไม่มี excerpt'}
                    </p>
                  </div>

                  <div className={styles.previewSection}>
                    <h4 className={styles.previewSectionTitle}>Content Preview</h4>
                    <p className={styles.previewText}>
                      {selectedBlog.content || 'ยังไม่มีเนื้อหา'}
                    </p>
                  </div>

                  {!!previewAdditionalImages.length && (
                    <div className={styles.previewSection}>
                      <h4 className={styles.previewSectionTitle}>รูปเพิ่มเติม</h4>

                      <div className={styles.previewGallery}>
                        {previewAdditionalImages.map((item, index) => (
                          <img
                            key={`${item.url}-${index}`}
                            src={item.url}
                            alt={`preview additional ${index + 1}`}
                            className={styles.previewGalleryImage}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}