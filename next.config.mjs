/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Lint is enforced via `npm run lint`; keep builds unblocked for preview speed.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
