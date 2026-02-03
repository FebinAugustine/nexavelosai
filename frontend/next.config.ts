const path = require("path");

const nextConfig = {
  /* config options here */
  reactStrictMode: true, // Recommended for the newest Next.js versions
  async rewrites() {
    return [
      {
        source: '/api/admin/:path*',
        destination: 'http://localhost:5000/admin/:path*', // Proxy to your backend
      },
    ];
  },
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
};

module.exports = nextConfig;
