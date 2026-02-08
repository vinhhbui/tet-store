/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Cho phép load ảnh từ mọi nguồn (Chỉ dùng lúc Dev)
      },
    ],
  },
};

export default nextConfig;