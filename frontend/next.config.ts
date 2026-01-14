import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use Turbopack with empty config (default for Next.js 16)
  turbopack: {},

  // Server external packages for SSR compatibility
  serverExternalPackages: [
    '@coinbase/cdp-sdk',
    '@solana-program/system',
    '@solana-program/token',
    '@base-org/account',
  ],

  // Transpile specific packages for proper ESM handling
  transpilePackages: [
    '@reown/appkit',
    '@reown/appkit-adapter-wagmi',
    '@wagmi/connectors',
    '@wagmi/core',
  ],
};

export default nextConfig;
