import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Keuangan Pribadi',
    short_name: 'Keuangan',
    description: 'Catatan keuangan pribadi dengan input AI dan scan struk',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#FAFAFA',
    theme_color: '#059669',
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
