import { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Folio',
    short_name: 'Folio',
    description: 'A curated collection of technical articles, deep dives, project documentation, and learning resources. By Sunil Kunchoor Basavaraju',
    start_url: '/articles/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/articles/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/articles/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
