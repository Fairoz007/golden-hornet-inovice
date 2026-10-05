/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/invoice',
        destination: '/invoices',
        permanent: false,
      },
      {
        source: '/quote',
        destination: '/quotation',
        permanent: false,
      },
      {
        source: '/quotes',
        destination: '/quotation',
        permanent: false,
      },
      {
        source: '/po',
        destination: '/purchase-order',
        permanent: false,
      },
      {
        source: '/do',
        destination: '/delivery-order',
        permanent: false,
      },
      {
        source: '/customer',
        destination: '/customers',
        permanent: false,
      },
      {
        source: '/audit',
        destination: '/audit-logs',
        permanent: false,
      },
      {
        source: '/audit-log',
        destination: '/audit-logs',
        permanent: false,
      },
    ]
  },
}

export default nextConfig
