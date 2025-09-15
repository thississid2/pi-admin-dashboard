/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    return [
      {
        source: '/api/lambda/:path*',
        destination: 'https://cyg01jt62k.execute-api.ap-south-1.amazonaws.com/dev/:path*',
      },
    ];
  },
}

module.exports = nextConfig
