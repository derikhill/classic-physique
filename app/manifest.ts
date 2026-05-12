import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Classic Physique',
    short_name: 'Classic',
    description: 'Personal hypertrophy training app — 80s/90s classic physique aesthetic',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0a0a0a',
    theme_color: '#0a0a0a',
    icons: [
      {
        src: '/icon',
        sizes: '192x192',
        type: 'image/png',
      },
    ],
  }
}
