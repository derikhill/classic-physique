import { ImageResponse } from 'next/og'

export const size = { width: 192, height: 192 }
export const contentType = 'image/png'

export default function Icon() {
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
          fontSize: 110,
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
