import { ImageResponse } from 'next/og'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default function TwitterImage() {
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
          background: '#0f172a',
          color: '#ffffff',
          fontFamily: 'Arial',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: 2,
            opacity: 0.8,
          }}
        >
          BLOGWEB
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
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
              color: '#cbd5e1',
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
            color: '#94a3b8',
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