import type { NextConfig } from 'next'
import bundleAnalyzer from '@next/bundle-analyzer'

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true, // <<< não roda ESLint no `next build`
  },
  typescript: {
    tsconfigPath: './tsconfig.json', // <<< especifica o caminho do tsconfig
  },
}

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

export default withBundleAnalyzer(nextConfig)
