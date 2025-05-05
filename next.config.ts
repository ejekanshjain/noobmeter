import type { NextConfig } from 'next'
import './src/env.mjs'

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true
  }
}

export default nextConfig
