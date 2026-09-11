import type { NextConfig } from 'next';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
    ],
  },
};

export default function config(phase: string): NextConfig {
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    // Also fail closed when someone bypasses npm scripts and runs next dev.
    const localUrls = ['http://127.0.0.1:54321', 'http://localhost:54321'];
    if (!localUrls.includes(process.env.NEXT_PUBLIC_SUPABASE_URL || '') ||
        process.env.NEXT_PUBLIC_SITE_URL !== 'http://localhost:3001' ||
        !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
      throw new Error('Development requires local Supabase and http://localhost:3001. Run npm run supabase:start, then npm run dev.');
    }
  }
  return nextConfig;
}
