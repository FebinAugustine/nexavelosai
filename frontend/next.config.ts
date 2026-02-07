import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true, // Recommended for the newest Next.js versions
  async rewrites() {
    return [
      {
        source: "/api/admin/:path*",
        destination: "http://localhost:5000/api/admin/:path*", // Proxy to your backend
      },
      {
        source: "/api/teams/:path*",
        destination: "http://localhost:5000/api/teams/:path*", // Proxy to your backend
      },
      {
        source: "/api/agents/:path*",
        destination: "http://localhost:5000/api/agents/:path*", // Proxy to your backend
      },
      {
        source: "/api/leads/:path*",
        destination: "http://localhost:5000/api/leads/:path*", // Proxy to your backend
      },
      {
        source: "/api/auth/:path*",
        destination: "http://localhost:5000/api/auth/:path*", // Proxy to your backend
      },
      {
        source: "/api/payments/:path*",
        destination: "http://localhost:5000/api/payments/:path*", // Proxy to your backend
      },
    ];
  },
};

export default nextConfig;
