/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'http',
          hostname: 'seahorse-app-fejfa.ondigitalocean.app',
          port: '',
          pathname: '/uploads/**',
        },
      ],
    },
  }
  
export default nextConfig;
