import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BlogWeb',
    short_name: 'BlogWeb',
    description:
      'เว็บบล็อกสำหรับอ่านบทความ ข่าวสาร และอัปเดตต่าง ๆ พร้อมระบบจัดการบทความและคอมเมนต์ผ่านแอดมิน',
    start_url: '/',
    display: 'standalone',
    background_color: '#f6f8fb',
    theme_color: '#0f172a',
    icons: [
      {
        src: '/icon',
        sizes: '64x64',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  }
}