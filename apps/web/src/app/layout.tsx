import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'Not a Label - Your Music Career, Amplified',
    template: '%s | Not a Label',
  },
  description: 'The all-in-one platform for independent artists. Distribute your music, grow your fanbase, and build a sustainable career with AI-powered insights.',
  keywords: 'music distribution, independent artists, music analytics, AI music assistant, streaming platforms, music career, artist tools, music marketing',
  authors: [{ name: 'Not a Label' }],
  creator: 'Not a Label',
  metadataBase: new URL('https://www.not-a-label.art'),
  openGraph: {
    title: 'Not a Label - Your Music Career, Amplified',
    description: 'The all-in-one platform for independent artists. Distribute your music, grow your fanbase, and build a sustainable career with AI-powered insights.',
    url: 'https://www.not-a-label.art',
    siteName: 'Not a Label',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Not a Label - Platform for Independent Artists',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Not a Label - Your Music Career, Amplified',
    description: 'The all-in-one platform for independent artists.',
    images: ['/twitter-image.png'],
    creator: '@notalabel',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}