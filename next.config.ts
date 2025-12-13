/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'api.dicebear.com'
      },
      {
        hostname: 'www.gravatar.com'
      }
    ],
    unoptimized: true
  }
}

export default nextConfig
