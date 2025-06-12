import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: process.env.NODE_ENV === 'production'
          ? '/uploads/:path*'
          : 'http://localhost:10000/uploads/:path*',
      },
    ];
  },
  env: {
    API_URL: process.env.NODE_ENV === 'production' 
      ? process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : ''
      : '',
  },
};

export default nextConfig;
