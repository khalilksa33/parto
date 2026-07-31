/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // Route API requests to the internal cluster service or fallback to localhost
        destination: `${process.env.INTERNAL_API_URL || 'http://localhost:8080'}/api/:path*`,
      },
    ];
  },
  // Conditionally configure static export for Hostinger shared webhosting
  ...(process.env.BUILD_TARGET === 'hostinger' ? {
    output: 'export',
    images: {
      unoptimized: true,
    },
  } : {}),
};

module.exports = nextConfig;
