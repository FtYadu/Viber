const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// E2E test runner with comprehensive reporting
async function runE2ETests() {
  console.log('🚀 Starting comprehensive E2E test suite...\n');

  const testSuites = [
    {
      name: 'Public Pages',
      command: 'npx playwright test e2e/tests/public-pages.spec.ts',
      description: 'Testing public-facing pages and functionality',
    },
    {
      name: 'Admin Workflows',
      command: 'npx playwright test e2e/tests/admin-workflows.spec.ts',
      description: 'Testing admin dashboard and management features',
    },
    {
      name: 'Client Portal',
      command: 'npx playwright test e2e/tests/client-portal.spec.ts',
      description: 'Testing client portal functionality',
    },
    {
      name: 'Cross-Device',
      command: 'npx playwright test e2e/tests/cross-device.spec.ts',
      description: 'Testing responsive design and cross-device compatibility',
    },
    {
      name: 'API Endpoints',
      command: 'npx playwright test e2e/tests/api-endpoints.spec.ts',
      description: 'Testing API endpoints and security',
    },
    {
      name: 'Performance',
      command: 'npx playwright test e2e/tests/performance.spec.ts',
      description: 'Testing performance and Core Web Vitals',
    },
  ];

  const results = [];
  let totalPassed = 0;
  let totalFailed = 0;

  for (const suite of testSuites) {
    console.log(`📋 Running ${suite.name} tests...`);
    console.log(`   ${suite.description}`);
    
    try {
      const startTime = Date.now();
      execSync(suite.command, { stdio: 'inherit' });
      const duration = Date.now() - startTime;
      
      console.log(`✅ ${suite.name} tests passed (${Math.round(duration / 1000)}s)\n`);
      
      results.push({
        name: suite.name,
        status: 'passed',
        duration,
      });
      totalPassed++;
    } catch (error) {
      console.error(`❌ ${suite.name} tests failed\n`);
      
      results.push({
        name: suite.name,
        status: 'failed',
        error: error.message,
      });
      totalFailed++;
    }
  }

  // Generate comprehensive report
  console.log('📊 E2E Test Results Summary:');
  console.log('================================');
  console.log(`Total test suites: ${testSuites.length}`);
  console.log(`Passed: ${totalPassed}`);
  console.log(`Failed: ${totalFailed}`);
  console.log(`Success rate: ${Math.round((totalPassed / testSuites.length) * 100)}%\n`);

  // Detailed results
  results.forEach(result => {
    const status = result.status === 'passed' ? '✅' : '❌';
    const duration = result.duration ? ` (${Math.round(result.duration / 1000)}s)` : '';
    console.log(`${status} ${result.name}${duration}`);
  });

  // Generate HTML report
  try {
    console.log('\n📄 Generating HTML report...');
    execSync('npx playwright show-report --host=0.0.0.0', { stdio: 'inherit' });
  } catch (error) {
    console.log('📄 HTML report available at: playwright-report/index.html');
  }

  // Save results to JSON
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      total: testSuites.length,
      passed: totalPassed,
      failed: totalFailed,
      successRate: Math.round((totalPassed / testSuites.length) * 100),
    },
    results,
  };

  const reportPath = path.join(__dirname, '../e2e-test-results.json');
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  console.log(`\n📄 Detailed results saved to: ${reportPath}`);

  // Exit with appropriate code
  if (totalFailed > 0) {
    console.log('\n❌ Some E2E tests failed. Please review the results.');
    process.exit(1);
  } else {
    console.log('\n✅ All E2E tests passed successfully!');
    process.exit(0);
  }
}

// Handle script execution
if (require.main === module) {
  runE2ETests().catch(error => {
    console.error('❌ E2E test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { runE2ETests };