/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Necessario para hot-reload dentro do container Docker
  output: 'standalone',
};

export default nextConfig;
