const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false,
  analyzerMode: 'static',
  generateStatsFile: true,
  statsFilename: '.analysis/stats.json',
  reportFilename: '.analysis/report.html',
});

// Import the main Next.js config
const nextConfig = require('./next.config.js');

// Export the config with bundle analyzer
module.exports = withBundleAnalyzer(nextConfig);