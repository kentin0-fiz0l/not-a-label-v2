/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.not-a-label.art',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'not-a-label-storage.s3.amazonaws.com',
        pathname: '/**',
      },
    ],
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'https://www.not-a-label.art',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    API_URL: process.env.API_URL || 'https://api.not-a-label.art',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_URL || 'https://api.not-a-label.art'}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;