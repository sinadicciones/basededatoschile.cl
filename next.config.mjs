/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.shopify.com" },
    ],
  },
  async redirects() {
    return [];
  },
};

export default nextConfig;
