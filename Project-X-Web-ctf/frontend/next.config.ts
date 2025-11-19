/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",   // file upload limit
      allowedOrigins: ["*"],   // optional
    },
  },
};

export default nextConfig;
