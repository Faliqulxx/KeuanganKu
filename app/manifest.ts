import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FREEKS FinMate',
    short_name: 'FinMate',
    description: 'Catatan keuangan pribadi dengan input AI dan scan struk',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#171513',
    theme_color: '#FF8A1C',
    icons: [
      {
        src: '/icons/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
