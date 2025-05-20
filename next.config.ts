/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  images: {
    domains: ['api.dicebear.com', 'www.gravatar.com'],
    unoptimized: true
  }
}

export default nextConfig
