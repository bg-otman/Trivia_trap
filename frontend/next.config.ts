import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  async redirects() {
    return [
      {
        source: "/reset-password",
        destination: "/login?mode=reset-password",
        permanent: false,
      },
    ];
  },
  reactCompiler: true,
};

export default nextConfig;
