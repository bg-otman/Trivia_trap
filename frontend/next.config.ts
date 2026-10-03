import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
