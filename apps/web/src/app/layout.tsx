'use client';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { useEffect } from 'react';
import './globals.css';
import { Providers } from '@/components/providers';
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt';

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
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Not a Label" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.variable}>
        <Providers>{children}</Providers>
        <PWAInstallPrompt />
      </body>
    </html>
  );
}