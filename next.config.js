/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    turbo: {
      loaders: {
        '.wgsl': ['raw-loader'],
      },
    },
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.wgsl$/i,
      use: 'raw-loader',
    })
    return config
  },
}

module.exports = nextConfig
