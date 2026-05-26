/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['pdf-parse', 'mammoth'],
  webpack: (config) => {
    config.optimization = {
      ...config.optimization,
      concatenateModules: false,
    };
    return config;
  },
};

export default nextConfig;
