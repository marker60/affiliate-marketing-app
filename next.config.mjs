/** @type {import('next').NextConfig} */
const isProd = process.env.VERCEL_ENV === 'production';

const nextConfig = {
  reactStrictMode: true,

  // Only allow ignoring in local/preview if you really need it.
  eslint: {
    ignoreDuringBuilds: !isProd, // true for dev/preview, false in prod
  },
  typescript: {
    ignoreBuildErrors: !isProd, // true for dev/preview, false in prod
  },

  // keep any other settings you had here (images, experimental, etc.)
};

export default nextConfig;
