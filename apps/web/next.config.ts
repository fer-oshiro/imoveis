import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true, // <<< não roda ESLint no `next build`
  },
}

export default nextConfig
