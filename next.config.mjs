/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/invoices',
        permanent: false,
      },
    ]
  },
}

export default nextConfig
