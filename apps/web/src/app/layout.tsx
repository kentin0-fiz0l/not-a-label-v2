import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Not a Label - Empowering Independent Musicians',
  description: 'The platform for independent musicians to grow their careers with AI-powered tools, analytics, and distribution.',
  keywords: 'independent music, music distribution, artist tools, music analytics, AI music assistant',
  metadataBase: new URL('https://www.not-a-label.art'),
  openGraph: {
    title: 'Not a Label',
    description: 'Empowering independent musicians worldwide',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
  },
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