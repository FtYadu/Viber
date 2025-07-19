const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Bundle size thresholds (in KB)
const BUNDLE_SIZE_LIMITS = {
  'pages/_app.js': 250,
  'pages/index.js': 150,
  'pages/portfolio.js': 200,
  'pages/admin.js': 300,
  'chunks/main.js': 200,
  'chunks/webpack.js': 50,
  'chunks/framework.js': 150,
};

// Performance budget
const PERFORMANCE_BUDGET = {
  totalJavaScript: 500, // KB
  totalCSS: 100, // KB
  totalImages: 1000, // KB
  totalFonts: 100, // KB
};

function analyzeBundleSize() {
  console.log('📦 Analyzing bundle size...\n');

  const buildDir = path.join(__dirname, '../.next');
  const statsFile = path.join(__dirname, '../.analysis/stats.json');

  if (!fs.existsSync(statsFile)) {
    console.log('⚠️  Bundle stats not found. Running build with analyzer...');
    try {
      execSync('npm run analyze', { stdio: 'inherit' });
    } catch (error) {
      console.error('❌ Failed to generate bundle analysis');
      return false;
    }
  }

  if (!fs.existsSync(statsFile)) {
    console.error('❌ Bundle stats still not found after analysis');
    return false;
  }

  try {
    const stats = JSON.parse(fs.readFileSync(statsFile, 'utf8'));
    const assets = stats.assets || [];

    console.log('Bundle Size Analysis:');
    console.log('====================');

    let totalJS = 0;
    let totalCSS = 0;
    let violations = [];

    assets.forEach(asset => {
      const sizeKB = Math.round(asset.size / 1024);
      const name = asset.name;

      if (name.endsWith('.js')) {
        totalJS += sizeKB;
        
        // Check against limits
        const limitKey = Object.keys(BUNDLE_SIZE_LIMITS).find(key => name.includes(key));
        if (limitKey && sizeKB > BUNDLE_SIZE_LIMITS[limitKey]) {
          violations.push({
            file: name,
            size: sizeKB,
            limit: BUNDLE_SIZE_LIMITS[limitKey],
            type: 'JavaScript'
          });
        }
      } else if (name.endsWith('.css')) {
        totalCSS += sizeKB;
      }

      if (sizeKB > 10) { // Only show files larger than 10KB
        const status = violations.some(v => v.file === name) ? '❌' : '✅';
        console.log(`  ${status} ${name}: ${sizeKB} KB`);
      }
    });

    console.log(`\nTotal JavaScript: ${totalJS} KB`);
    console.log(`Total CSS: ${totalCSS} KB`);

    // Check performance budget
    const budgetViolations = [];
    if (totalJS > PERFORMANCE_BUDGET.totalJavaScript) {
      budgetViolations.push(`JavaScript: ${totalJS}KB > ${PERFORMANCE_BUDGET.totalJavaScript}KB`);
    }
    if (totalCSS > PERFORMANCE_BUDGET.totalCSS) {
      budgetViolations.push(`CSS: ${totalCSS}KB > ${PERFORMANCE_BUDGET.totalCSS}KB`);
    }

    if (violations.length > 0) {
      console.log('\n❌ Bundle Size Violations:');
      violations.forEach(v => {
        console.log(`  - ${v.file}: ${v.size}KB exceeds limit of ${v.limit}KB`);
      });
    }

    if (budgetViolations.length > 0) {
      console.log('\n❌ Performance Budget Violations:');
      budgetViolations.forEach(v => console.log(`  - ${v}`));
    }

    if (violations.length === 0 && budgetViolations.length === 0) {
      console.log('\n✅ All bundle size checks passed!');
      return true;
    }

    return false;
  } catch (error) {
    console.error('❌ Error analyzing bundle:', error.message);
    return false;
  }
}

function analyzeImageOptimization() {
  console.log('\n🖼️  Analyzing image optimization...\n');

  const publicDir = path.join(__dirname, '../public');
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.avif'];
  
  let totalImageSize = 0;
  let unoptimizedImages = [];
  let largeImages = [];

  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        scanDirectory(filePath);
      } else {
        const ext = path.extname(file).toLowerCase();
        if (imageExtensions.includes(ext)) {
          const sizeKB = Math.round(stat.size / 1024);
          totalImageSize += sizeKB;
          
          // Check for large images
          if (sizeKB > 500) {
            largeImages.push({ file: path.relative(publicDir, filePath), size: sizeKB });
          }
          
          // Check for unoptimized formats
          if (['.jpg', '.jpeg', '.png'].includes(ext) && sizeKB > 100) {
            unoptimizedImages.push({ file: path.relative(publicDir, filePath), size: sizeKB });
          }
        }
      }
    });
  }

  if (fs.existsSync(publicDir)) {
    scanDirectory(publicDir);
  }

  console.log(`Total image size: ${totalImageSize} KB`);

  if (largeImages.length > 0) {
    console.log('\n⚠️  Large images (>500KB):');
    largeImages.forEach(img => {
      console.log(`  - ${img.file}: ${img.size} KB`);
    });
  }

  if (unoptimizedImages.length > 0) {
    console.log('\n💡 Consider optimizing these images:');
    unoptimizedImages.forEach(img => {
      console.log(`  - ${img.file}: ${img.size} KB (consider WebP/AVIF)`);
    });
  }

  const imagesBudgetOk = totalImageSize <= PERFORMANCE_BUDGET.totalImages;
  if (!imagesBudgetOk) {
    console.log(`\n❌ Images exceed budget: ${totalImageSize}KB > ${PERFORMANCE_BUDGET.totalImages}KB`);
  }

  return imagesBudgetOk && largeImages.length === 0;
}

function generateOptimizationRecommendations() {
  console.log('\n💡 Performance Optimization Recommendations:');
  console.log('============================================');

  const recommendations = [
    '1. Enable gzip/brotli compression on your server',
    '2. Implement proper caching headers for static assets',
    '3. Use next/image for automatic image optimization',
    '4. Lazy load images and components below the fold',
    '5. Minimize and tree-shake unused JavaScript',
    '6. Use dynamic imports for code splitting',
    '7. Optimize fonts with font-display: swap',
    '8. Preload critical resources',
    '9. Use service workers for caching',
    '10. Monitor Core Web Vitals regularly',
  ];

  recommendations.forEach(rec => console.log(`  ${rec}`));

  console.log('\n🔧 Quick fixes:');
  console.log('  - Run: npm run build && npm run analyze');
  console.log('  - Run: npm run lighthouse');
  console.log('  - Check: .lighthouse/summary.json for detailed metrics');
}

async function main() {
  console.log('🚀 Starting performance analysis...\n');

  const bundleOk = analyzeBundleSize();
  const imagesOk = analyzeImageOptimization();

  generateOptimizationRecommendations();

  if (bundleOk && imagesOk) {
    console.log('\n✅ Performance analysis passed!');
    process.exit(0);
  } else {
    console.log('\n❌ Performance analysis found issues that need attention.');
    process.exit(1);
  }
}

// Run the analysis if this script is executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  analyzeBundleSize,
  analyzeImageOptimization,
  generateOptimizationRecommendations,
};