import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { Navbar } from '@/components/navigation/navbar';
import { GoogleAnalytics } from '@/components/analytics/google-analytics';
import { getNonce } from '@/lib/security/get-nonce';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://think.maslowai.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Think by Maslow AI - See How AI Really Thinks',
    template: '%s | Think by Maslow AI',
  },
  description:
    'Visual AI reasoning platform with mental models, multi-agent debates, and async workflows. Stop trusting AI blindly. See how it thinks.',
  keywords: [
    'AI transparency',
    'visual reasoning',
    'mental models',
    'MCP',
    'Model Context Protocol',
    'AI observability',
    'multi-agent AI',
    'Claude',
    'ChatGPT',
  ],
  icons: {
    icon: [
      { url: '/logos/favicon.ico', sizes: 'any' },
      { url: '/logos/maslow_just_logo_color.webp', type: 'image/webp' },
    ],
    apple: '/logos/maslow_just_logo_color.webp',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Think by Maslow AI',
    title: 'Think by Maslow AI - See How AI Really Thinks',
    description:
      'Visual AI reasoning platform with mental models, multi-agent debates, and async workflows. Stop trusting AI blindly. See how it thinks.',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Think by Maslow AI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Think by Maslow AI - See How AI Really Thinks',
    description:
      'Visual AI reasoning platform with mental models, multi-agent debates, and async workflows. Stop trusting AI blindly. See how it thinks.',
    images: [`${siteUrl}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get the CSP nonce from headers for inline scripts
  const nonce = getNonce();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <GoogleAnalytics nonce={nonce} />
      </head>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
