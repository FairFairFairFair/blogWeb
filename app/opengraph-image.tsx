import { ImageResponse } from 'next/og'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px',
          background:
            'linear-gradient(135deg, #f8fafc 0%, #eef2f7 45%, #dbe4f0 100%)',
          color: '#0f172a',
          fontFamily: 'Arial',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: 2,
          }}
        >
          BLOG
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 88,
              lineHeight: 1,
              fontWeight: 700,
              fontFamily: 'Georgia',
              maxWidth: '900px',
            }}
          >
            BlogWeb
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: 34,
              lineHeight: 1.4,
              color: '#475569',
              maxWidth: '920px',
            }}
          >
            Stories, updates, and ideas worth reading.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 28,
            color: '#64748b',
          }}
        >
          blog-web-roan.vercel.app
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}