import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://blog-web-roan.vercel.app'),
  title: {
    default: 'BlogWeb',
    template: '%s | BlogWeb',
  },
  description: 'เว็บบล็อกสำหรับอ่านบทความ ข่าวสาร และอัปเดตต่าง ๆ',
  applicationName: 'BlogWeb',
  keywords: [
    'BlogWeb',
    'Blog',
    'Next.js blog',
    'Supabase blog',
    'บทความ',
    'ข่าวสาร',
    'คอมเมนต์',
  ],
  authors: [{ name: 'BlogWeb' }],
  creator: 'BlogWeb',
  publisher: 'BlogWeb',
  openGraph: {
    type: 'website',
    locale: 'th_TH',
    url: 'https://blog-web-roan.vercel.app',
    siteName: 'BlogWeb',
    title: 'BlogWeb',
    description: 'เว็บบล็อกสำหรับอ่านบทความ ข่าวสาร และอัปเดตต่าง ๆ',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'BlogWeb',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BlogWeb',
    description: 'เว็บบล็อกสำหรับอ่านบทความ ข่าวสาร และอัปเดตต่าง ๆ',
    images: ['/twitter-image'],
  },
  alternates: {
    canonical: 'https://blog-web-roan.vercel.app',
  },
  manifest: '/manifest.webmanifest',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  )
}