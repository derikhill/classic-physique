import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: '#0a0a0a',
          color: '#c8f542',
          fontSize: 102,
          fontWeight: 900,
          letterSpacing: -2,
          fontFamily: 'sans-serif',
        }}
      >
        CP
      </div>
    ),
    { ...size },
  )
}
