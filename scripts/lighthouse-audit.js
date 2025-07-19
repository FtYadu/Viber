const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

// Configuration for Lighthouse audit
const config = {
  extends: 'lighthouse:default',
  settings: {
    onlyAudits: [
      'first-contentful-paint',
      'largest-contentful-paint',
      'first-meaningful-paint',
      'speed-index',
      'cumulative-layout-shift',
      'total-blocking-time',
      'max-potential-fid',
      'interactive',
      'server-response-time',
      'render-blocking-resources',
      'unused-css-rules',
      'unused-javascript',
      'modern-image-formats',
      'uses-optimized-images',
      'uses-text-compression',
      'uses-responsive-images',
      'efficient-animated-content',
      'preload-lcp-image',
      'uses-rel-preconnect',
      'uses-rel-preload',
      'font-display',
      'third-party-summary',
      'bootup-time',
      'mainthread-work-breakdown',
      'dom-size',
      'critical-request-chains',
      'user-timings',
      'metrics',
    ],
  },
};

// URLs to audit
const urls = [
  'http://localhost:3000',
  'http://localhost:3000/portfolio',
  'http://localhost:3000/admin',
  'http://localhost:3000/status',
];

// Chrome launch options
const chromeOptions = {
  chromeFlags: [
    '--headless',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-extensions',
  ],
};

async function runLighthouseAudit(url, chrome) {
  console.log(`🔍 Auditing: ${url}`);
  
  try {
    const runnerResult = await lighthouse(url, {
      port: chrome.port,
      disableDeviceEmulation: false,
      chromeFlags: chromeOptions.chromeFlags,
    }, config);

    if (!runnerResult) {
      throw new Error('Lighthouse returned no results');
    }

    const { lhr } = runnerResult;
    
    // Extract key metrics
    const metrics = {
      url,
      timestamp: new Date().toISOString(),
      scores: {
        performance: Math.round(lhr.categories.performance.score * 100),
        accessibility: Math.round(lhr.categories.accessibility.score * 100),
        bestPractices: Math.round(lhr.categories['best-practices'].score * 100),
        seo: Math.round(lhr.categories.seo.score * 100),
      },
      metrics: {
        fcp: lhr.audits['first-contentful-paint'].numericValue,
        lcp: lhr.audits['largest-contentful-paint'].numericValue,
        cls: lhr.audits['cumulative-layout-shift'].numericValue,
        tbt: lhr.audits['total-blocking-time'].numericValue,
        si: lhr.audits['speed-index'].numericValue,
        tti: lhr.audits['interactive'].numericValue,
      },
      opportunities: lhr.audits['render-blocking-resources'].details?.items?.length || 0,
      diagnostics: {
        unusedCss: lhr.audits['unused-css-rules'].details?.overallSavingsBytes || 0,
        unusedJs: lhr.audits['unused-javascript'].details?.overallSavingsBytes || 0,
        domSize: lhr.audits['dom-size'].numericValue,
      },
    };

    return { metrics, report: runnerResult.report };
  } catch (error) {
    console.error(`❌ Error auditing ${url}:`, error.message);
    return null;
  }
}

async function generateReport(results) {
  const reportDir = path.join(__dirname, '../.lighthouse');
  
  // Ensure report directory exists
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  // Generate summary report
  const summary = {
    timestamp: new Date().toISOString(),
    results: results.filter(Boolean).map(r => r.metrics),
    averageScores: {},
  };

  // Calculate average scores
  const validResults = results.filter(Boolean);
  if (validResults.length > 0) {
    const scoreKeys = ['performance', 'accessibility', 'bestPractices', 'seo'];
    scoreKeys.forEach(key => {
      const scores = validResults.map(r => r.metrics.scores[key]);
      summary.averageScores[key] = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    });
  }

  // Save summary
  fs.writeFileSync(
    path.join(reportDir, 'summary.json'),
    JSON.stringify(summary, null, 2)
  );

  // Save individual HTML reports
  results.forEach((result, index) => {
    if (result && result.report) {
      const urlSlug = urls[index].replace(/[^a-zA-Z0-9]/g, '-');
      fs.writeFileSync(
        path.join(reportDir, `${urlSlug}.html`),
        result.report
      );
    }
  });

  return summary;
}

function printSummary(summary) {
  console.log('\n📊 Lighthouse Audit Summary');
  console.log('================================');
  
  if (Object.keys(summary.averageScores).length === 0) {
    console.log('❌ No successful audits completed');
    return;
  }

  console.log('Average Scores:');
  Object.entries(summary.averageScores).forEach(([category, score]) => {
    const emoji = score >= 90 ? '🟢' : score >= 70 ? '🟡' : '🔴';
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1');
    console.log(`  ${emoji} ${categoryName}: ${score}/100`);
  });

  console.log('\nDetailed Results:');
  summary.results.forEach((result) => {
    console.log(`\n📄 ${result.url}`);
    console.log(`  Performance: ${result.scores.performance}/100`);
    console.log(`  Accessibility: ${result.scores.accessibility}/100`);
    console.log(`  Best Practices: ${result.scores.bestPractices}/100`);
    console.log(`  SEO: ${result.scores.seo}/100`);
    
    if (result.scores.performance < 90) {
      console.log('  ⚠️  Performance improvements needed');
      console.log(`     - FCP: ${Math.round(result.metrics.fcp)}ms`);
      console.log(`     - LCP: ${Math.round(result.metrics.lcp)}ms`);
      console.log(`     - CLS: ${result.metrics.cls.toFixed(3)}`);
    }
  });

  console.log(`\n📁 Detailed reports saved to: ${path.join(__dirname, '../.lighthouse')}`);
}

async function main() {
  console.log('🚀 Starting Lighthouse performance audit...\n');

  let chrome;
  try {
    // Launch Chrome
    chrome = await chromeLauncher.launch(chromeOptions);
    console.log(`🌐 Chrome launched on port ${chrome.port}`);

    // Run audits for all URLs
    const results = [];
    for (const url of urls) {
      const result = await runLighthouseAudit(url, chrome);
      results.push(result);
      
      // Add delay between audits to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Generate and display report
    const summary = await generateReport(results);
    printSummary(summary);

    // Check if performance targets are met
    const performanceTarget = 90;
    const avgPerformance = summary.averageScores.performance || 0;
    
    if (avgPerformance >= performanceTarget) {
      console.log(`\n✅ Performance target achieved! Average score: ${avgPerformance}/100`);
      process.exit(0);
    } else {
      console.log(`\n❌ Performance target not met. Average score: ${avgPerformance}/100 (target: ${performanceTarget}/100)`);
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Lighthouse audit failed:', error);
    process.exit(1);
  } finally {
    if (chrome) {
      await chrome.kill();
    }
  }
}

// Run the audit if this script is executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runLighthouseAudit, generateReport };