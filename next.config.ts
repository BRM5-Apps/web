import type { NextConfig } from "next";

const requiredEnvVars = [
  "NEXTAUTH_URL",
  "NEXTAUTH_SECRET",
  "DISCORD_CLIENT_ID",
  "DISCORD_CLIENT_SECRET",
] as const;

// Validate required env vars at build time
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`⚠ Missing required environment variable: ${envVar}`);
  }
}

const nextConfig: NextConfig = {
  output: "standalone",
  // Fix for clientReferenceManifest error in Next.js 15
  outputFileTracing: false,
  experimental: {
    // Ensure client components work properly
    serverActions: {},
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
      },
    ],
  },
};

export default nextConfig;
