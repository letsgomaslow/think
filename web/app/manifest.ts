import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Think by Maslow AI',
    short_name: 'Think',
    description: 'Visual AI reasoning platform with mental models and collaborative debugging',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f1729',
    theme_color: '#6DC4AD',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
