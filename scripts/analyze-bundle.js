const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Ensure the analysis directory exists
const analysisDir = path.join(__dirname, '../.analysis');
if (!fs.existsSync(analysisDir)) {
  fs.mkdirSync(analysisDir, { recursive: true });
}

console.log('Building application with bundle analyzer...');

// Set environment variables for the build
process.env.ANALYZE = 'true';
process.env.NODE_ENV = 'production';

try {
  // Run the build with bundle analyzer
  execSync('next build', {
    stdio: 'inherit',
    env: {
      ...process.env,
      ANALYZE: 'true',
    },
  });

  console.log('\n✅ Bundle analysis complete!');
  console.log('Check the .analysis directory for the bundle analysis report.');
} catch (error) {
  console.error('\n❌ Bundle analysis failed:', error.message);
  process.exit(1);
}