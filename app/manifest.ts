import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    short_name: 'Klola',
    name: 'Klola — Portal Tiket & Demo Produk Indonesia',
    description: 'Hub terpadu Klola Indonesia untuk eksplorasi demo produk, pelaporan tiket dukungan, dan koneksi langsung ke tim support.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0B3464',
    lang: 'id',
    dir: 'ltr',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['business', 'productivity'],
  };
}
