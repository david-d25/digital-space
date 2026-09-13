/** @type {import('next').NextConfig} */
const nextConfig = {
  // Bundles the server with only the dependencies it actually reaches, so the
  // runtime image carries that instead of the whole `node_modules`.
  output: 'standalone',

  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '',
  productionBrowserSourceMaps: false,
  reactStrictMode: true,
  turbopack: {
    rules: {
      '*.svg': {
        as: '*.js',
        loaders: ['@svgr/webpack'],
      },
    },
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      use: ['@svgr/webpack'],
    });
    return config;
  },
}

module.exports = nextConfig