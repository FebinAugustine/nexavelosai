const path = require("path");

const nextConfig = {
  /* config options here */
  reactStrictMode: true, // Recommended for the newest Next.js versions
  async rewrites() {
    return [
      {
        source: "/api/admin/:path*",
        destination: "http://localhost:5000/admin/:path*", // Proxy to your backend
      },
      {
        source: "/api/teams/:path*",
        destination: "http://localhost:5000/teams/:path*", // Proxy to your backend
      },
      {
        source: "/api/agents/:path*",
        destination: "http://localhost:5000/agents/:path*", // Proxy to your backend
      },
      {
        source: "/api/leads/:path*",
        destination: "http://localhost:5000/leads/:path*", // Proxy to your backend
      },
      {
        source: "/api/auth/:path*",
        destination: "http://localhost:5000/auth/:path*", // Proxy to your backend
      },
      {
        source: "/api/payments/:path*",
        destination: "http://localhost:5000/payments/:path*", // Proxy to your backend
      },
    ];
  },
};

module.exports = nextConfig;
