/** @type {import('next').NextConfig} */
const nextConfig = {
  serverActions: {
    bodySizeLimit: '20mb', // ✅ increase file upload limit
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb', // ✅ ensure it's picked up even in dev
    },
  },
};

export default nextConfig;
