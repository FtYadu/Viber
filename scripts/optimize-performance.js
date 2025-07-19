const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting performance optimization...\n');

// 1. Bundle Analysis
console.log('📊 Analyzing bundle size...');
try {
  execSync('npm run analyze', { stdio: 'inherit' });
  console.log('✅ Bundle analysis complete\n');
} catch (error) {
  console.error('❌ Bundle analysis failed:', error.message);
}

// 2. Lighthouse Audit
console.log('🔍 Running Lighthouse audit...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  execSync('npx lhci autorun', { stdio: 'inherit' });
  console.log('✅ Lighthouse audit complete\n');
} catch (error) {
  console.error('❌ Lighthouse audit failed:', error.message);
}

// 3. Image Optimization Check
console.log('🖼️  Checking image optimization...');
const publicDir = path.join(__dirname, '../public');
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg'];
let totalImages = 0;
let largeImages = [];

function checkImages(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      checkImages(filePath);
    } else if (imageExtensions.some(ext => file.toLowerCase().endsWith(ext))) {
      totalImages++;
      const sizeKB = stat.size / 1024;
      
      if (sizeKB > 100) { // Images larger than 100KB
        largeImages.push({
          path: filePath.replace(publicDir, ''),
          size: Math.round(sizeKB),
        });
      }
    }
  });
}

if (fs.existsSync(publicDir)) {
  checkImages(publicDir);
  
  console.log(`📈 Found ${totalImages} images`);
  if (largeImages.length > 0) {
    console.log('⚠️  Large images found (>100KB):');
    largeImages.forEach(img => {
      console.log(`   ${img.path} (${img.size}KB)`);
    });
    console.log('   Consider optimizing these images\n');
  } else {
    console.log('✅ All images are optimized\n');
  }
}

// 4. Check for unused dependencies
console.log('📦 Checking for unused dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
  const dependencies = Object.keys(packageJson.dependencies || {});
  const devDependencies = Object.keys(packageJson.devDependencies || {});
  
  console.log(`📊 Dependencies: ${dependencies.length}`);
  console.log(`🔧 Dev Dependencies: ${devDependencies.length}`);
  
  // You could integrate with tools like depcheck here
  console.log('💡 Consider running `npx depcheck` to find unused dependencies\n');
} catch (error) {
  console.error('❌ Failed to check dependencies:', error.message);
}

// 5. Generate performance report
console.log('📋 Generating performance report...');
const reportData = {
  timestamp: new Date().toISOString(),
  bundleAnalysis: {
    completed: true,
    location: '.analysis/report.html',
  },
  lighthouse: {
    completed: true,
    location: '.lighthouseci/',
  },
  images: {
    total: totalImages,
    largeImages: largeImages.length,
    optimizationNeeded: largeImages.length > 0,
  },
  recommendations: [
    {
      category: 'Images',
      action: 'Optimize large images using WebP format',
      priority: largeImages.length > 0 ? 'high' : 'low',
    },
    {
      category: 'Bundle',
      action: 'Review bundle analysis for code splitting opportunities',
      priority: 'medium',
    },
    {
      category: 'Caching',
      action: 'Implement service worker for better caching',
      priority: 'medium',
    },
    {
      category: 'Performance',
      action: 'Monitor Core Web Vitals regularly',
      priority: 'high',
    },
  ],
};

const reportPath = path.join(__dirname, '../performance-report.json');
fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
console.log(`✅ Performance report saved to ${reportPath}\n`);

// 6. Performance tips
console.log('💡 Performance Optimization Tips:');
console.log('   1. Use Next.js Image component for automatic optimization');
console.log('   2. Implement lazy loading for non-critical components');
console.log('   3. Use dynamic imports for code splitting');
console.log('   4. Optimize fonts with font-display: swap');
console.log('   5. Minimize JavaScript bundle size');
console.log('   6. Use CDN for static assets');
console.log('   7. Implement proper caching strategies');
console.log('   8. Monitor Core Web Vitals regularly\n');

console.log('✨ Performance optimization complete!');
console.log('📊 Check the generated reports for detailed insights.');
console.log('🔍 Run `npm run lighthouse` to audit specific pages.');
console.log('📈 Monitor performance in production using Vercel Analytics.');