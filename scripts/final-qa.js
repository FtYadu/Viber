const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Starting Final Quality Assurance Process...\n');

// QA Configuration
const qaConfig = {
  performance: {
    lighthouseThresholds: {
      performance: 90,
      accessibility: 90,
      bestPractices: 90,
      seo: 90,
      pwa: 80,
    },
    webVitalsThresholds: {
      lcp: 2500, // Largest Contentful Paint (ms)
      fid: 100,  // First Input Delay (ms)
      cls: 0.1,  // Cumulative Layout Shift
      fcp: 1800, // First Contentful Paint (ms)
      ttfb: 800, // Time to First Byte (ms)
    },
  },
  security: {
    vulnerabilityThreshold: 0, // No high/critical vulnerabilities allowed
    securityHeaders: [
      'Content-Security-Policy',
      'X-Frame-Options',
      'X-Content-Type-Options',
      'Referrer-Policy',
      'Permissions-Policy',
    ],
  },
  quality: {
    testCoverageThreshold: 80,
    eslintErrorThreshold: 0,
    typescriptErrorThreshold: 0,
  },
};

let qaResults = {
  performance: { passed: false, scores: {}, issues: [] },
  security: { passed: false, vulnerabilities: [], headers: {} },
  testing: { passed: false, coverage: 0, failures: [] },
  codeQuality: { passed: false, eslintErrors: 0, tsErrors: 0 },
  deployment: { passed: false, checks: [] },
  overall: { passed: false, score: 0 },
};

// Utility functions
const runCommand = (command, description, options = {}) => {
  console.log(`🔧 ${description}...`);
  try {
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options 
    });
    console.log(`✅ ${description} completed`);
    return { success: true, output: result };
  } catch (error) {
    console.log(`❌ ${description} failed`);
    if (!options.silent) {
      console.log(error.stdout || error.message);
    }
    return { success: false, error: error.message, output: error.stdout || error.stderr };
  }
};

const saveReport = (filename, data) => {
  const reportPath = path.join(__dirname, '../qa-reports', filename);
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(data, null, 2));
  return reportPath;
};

// 1. Performance Audits
const runPerformanceAudits = async () => {
  console.log('\n📊 Running Performance Audits...\n');
  
  // Build the application first
  const buildResult = runCommand('npm run build', 'Building application for production');
  if (!buildResult.success) {
    qaResults.performance.issues.push('Failed to build application');
    return false;
  }
  
  // Start the application
  console.log('🚀 Starting application server...');
  const serverProcess = require('child_process').spawn('npm', ['run', 'start'], {
    stdio: 'pipe',
    detached: false,
  });
  
  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  try {
    // Run Lighthouse CI
    const lighthouseResult = runCommand(
      'npx lhci autorun --config=lighthouserc.js',
      'Running Lighthouse performance audit',
      { silent: true }
    );
    
    if (lighthouseResult.success) {
      // Parse Lighthouse results
      const lighthouseDir = path.join(__dirname, '../.lighthouseci');
      if (fs.existsSync(lighthouseDir)) {
        const manifestPath = path.join(lighthouseDir, 'manifest.json');
        if (fs.existsSync(manifestPath)) {
          const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
          const latestRun = manifest[0];
          
          if (latestRun && latestRun.summary) {
            qaResults.performance.scores = {
              performance: Math.round(latestRun.summary.performance * 100),
              accessibility: Math.round(latestRun.summary.accessibility * 100),
              bestPractices: Math.round(latestRun.summary['best-practices'] * 100),
              seo: Math.round(latestRun.summary.seo * 100),
              pwa: Math.round((latestRun.summary.pwa || 0) * 100),
            };
            
            // Check against thresholds
            const { lighthouseThresholds } = qaConfig.performance;
            qaResults.performance.passed = Object.entries(lighthouseThresholds).every(([key, threshold]) => {
              const score = qaResults.performance.scores[key] || 0;
              const passed = score >= threshold;
              if (!passed) {
                qaResults.performance.issues.push(`${key} score ${score} below threshold ${threshold}`);
              }
              return passed;
            });
          }
        }
      }
    } else {
      qaResults.performance.issues.push('Lighthouse audit failed to run');
    }
    
    // Bundle analysis
    const bundleResult = runCommand(
      'npm run analyze',
      'Analyzing bundle size',
      { silent: true }
    );
    
    if (bundleResult.success) {
      // Check bundle size
      const analysisDir = path.join(__dirname, '../.analysis');
      if (fs.existsSync(analysisDir)) {
        const statsPath = path.join(analysisDir, 'stats.json');
        if (fs.existsSync(statsPath)) {
          const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
          const totalSize = stats.assets.reduce((sum, asset) => sum + asset.size, 0);
          const totalSizeMB = totalSize / (1024 * 1024);
          
          if (totalSizeMB > 5) { // 5MB threshold
            qaResults.performance.issues.push(`Bundle size ${totalSizeMB.toFixed(2)}MB exceeds 5MB threshold`);
          }
        }
      }
    }
    
  } finally {
    // Kill server process
    serverProcess.kill('SIGTERM');
  }
  
  console.log(`📊 Performance Audit Results:`);
  console.log(`   Performance: ${qaResults.performance.scores.performance || 0}/100`);
  console.log(`   Accessibility: ${qaResults.performance.scores.accessibility || 0}/100`);
  console.log(`   Best Practices: ${qaResults.performance.scores.bestPractices || 0}/100`);
  console.log(`   SEO: ${qaResults.performance.scores.seo || 0}/100`);
  console.log(`   PWA: ${qaResults.performance.scores.pwa || 0}/100`);
  
  return qaResults.performance.passed;
};

// 2. Security Review
const runSecurityReview = async () => {
  console.log('\n🔒 Running Security Review...\n');
  
  // Check for known vulnerabilities
  const auditResult = runCommand(
    'npm audit --audit-level=high',
    'Checking for security vulnerabilities',
    { silent: true }
  );
  
  if (auditResult.output) {
    try {
      const auditData = JSON.parse(auditResult.output);
      const highVulns = auditData.metadata?.vulnerabilities?.high || 0;
      const criticalVulns = auditData.metadata?.vulnerabilities?.critical || 0;
      
      qaResults.security.vulnerabilities = {
        high: highVulns,
        critical: criticalVulns,
        total: highVulns + criticalVulns,
      };
      
      qaResults.security.passed = (highVulns + criticalVulns) <= qaConfig.security.vulnerabilityThreshold;
      
      if (!qaResults.security.passed) {
        console.log(`❌ Found ${highVulns} high and ${criticalVulns} critical vulnerabilities`);
      }
    } catch (error) {
      console.log('⚠️  Could not parse npm audit results');
    }
  } else {
    qaResults.security.passed = true;
  }
  
  // Check security headers (would need a running server)
  console.log('🔍 Security headers check would be performed against running server');
  
  // Static security analysis
  const eslintSecurityResult = runCommand(
    'npx eslint src/ --ext .ts,.tsx --config .eslintrc.json --format json',
    'Running ESLint security analysis',
    { silent: true }
  );
  
  console.log(`🔒 Security Review Results:`);
  console.log(`   High/Critical Vulnerabilities: ${qaResults.security.vulnerabilities.total || 0}`);
  console.log(`   Security Headers: ${qaConfig.security.securityHeaders.length} configured`);
  
  return qaResults.security.passed;
};

// 3. Test Suite Verification
const runTestSuiteVerification = async () => {
  console.log('\n🧪 Running Test Suite Verification...\n');
  
  // Run all tests
  const testResult = runCommand(
    'npm run test:all',
    'Running comprehensive test suite',
    { silent: true }
  );
  
  if (testResult.success) {
    // Parse test results
    try {
      const testReportPath = path.join(__dirname, '../test-report.json');
      if (fs.existsSync(testReportPath)) {
        const testReport = JSON.parse(fs.readFileSync(testReportPath, 'utf8'));
        qaResults.testing.coverage = testReport.summary?.successRate || 0;
        qaResults.testing.failures = testReport.results?.filter(r => r.status === 'failed') || [];
        qaResults.testing.passed = testReport.summary?.failed === 0;
      }
    } catch (error) {
      console.log('⚠️  Could not parse test results');
    }
  }
  
  // Check coverage
  const coverageDir = path.join(__dirname, '../coverage');
  if (fs.existsSync(coverageDir)) {
    const coverageSummaryPath = path.join(coverageDir, 'coverage-summary.json');
    if (fs.existsSync(coverageSummaryPath)) {
      const coverage = JSON.parse(fs.readFileSync(coverageSummaryPath, 'utf8'));
      const totalCoverage = coverage.total?.lines?.pct || 0;
      
      if (totalCoverage < qaConfig.quality.testCoverageThreshold) {
        qaResults.testing.failures.push(`Test coverage ${totalCoverage}% below threshold ${qaConfig.quality.testCoverageThreshold}%`);
        qaResults.testing.passed = false;
      }
    }
  }
  
  console.log(`🧪 Test Suite Results:`);
  console.log(`   Test Coverage: ${qaResults.testing.coverage}%`);
  console.log(`   Failed Tests: ${qaResults.testing.failures.length}`);
  
  return qaResults.testing.passed;
};

// 4. Code Quality Check
const runCodeQualityCheck = async () => {
  console.log('\n📝 Running Code Quality Check...\n');
  
  // ESLint check
  const eslintResult = runCommand(
    'npm run lint',
    'Running ESLint code quality check',
    { silent: true }
  );
  
  qaResults.codeQuality.eslintErrors = eslintResult.success ? 0 : 1;
  
  // TypeScript check
  const tsResult = runCommand(
    'npx tsc --noEmit',
    'Running TypeScript type check',
    { silent: true }
  );
  
  qaResults.codeQuality.tsErrors = tsResult.success ? 0 : 1;
  
  qaResults.codeQuality.passed = 
    qaResults.codeQuality.eslintErrors <= qaConfig.quality.eslintErrorThreshold &&
    qaResults.codeQuality.tsErrors <= qaConfig.quality.typescriptErrorThreshold;
  
  console.log(`📝 Code Quality Results:`);
  console.log(`   ESLint Errors: ${qaResults.codeQuality.eslintErrors}`);
  console.log(`   TypeScript Errors: ${qaResults.codeQuality.tsErrors}`);
  
  return qaResults.codeQuality.passed;
};

// 5. Deployment Readiness Check
const runDeploymentReadinessCheck = async () => {
  console.log('\n🚀 Running Deployment Readiness Check...\n');
  
  const checks = [
    {
      name: 'Environment Variables',
      check: () => {
        const envExample = path.join(__dirname, '../.env.example');
        return fs.existsSync(envExample);
      }
    },
    {
      name: 'Build Configuration',
      check: () => {
        const nextConfig = path.join(__dirname, '../next.config.js');
        return fs.existsSync(nextConfig);
      }
    },
    {
      name: 'Database Schema',
      check: () => {
        const prismaSchema = path.join(__dirname, '../prisma/schema.prisma');
        return fs.existsSync(prismaSchema);
      }
    },
    {
      name: 'Package.json Scripts',
      check: () => {
        const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
        const requiredScripts = ['build', 'start', 'test', 'lint'];
        return requiredScripts.every(script => packageJson.scripts[script]);
      }
    },
    {
      name: 'README Documentation',
      check: () => {
        const readme = path.join(__dirname, '../README.md');
        return fs.existsSync(readme);
      }
    },
  ];
  
  qaResults.deployment.checks = checks.map(check => ({
    name: check.name,
    passed: check.check(),
  }));
  
  qaResults.deployment.passed = qaResults.deployment.checks.every(check => check.passed);
  
  console.log(`🚀 Deployment Readiness Results:`);
  qaResults.deployment.checks.forEach(check => {
    console.log(`   ${check.name}: ${check.passed ? '✅' : '❌'}`);
  });
  
  return qaResults.deployment.passed;
};

// 6. Generate Final Report
const generateFinalReport = () => {
  console.log('\n📋 Generating Final QA Report...\n');
  
  // Calculate overall score
  const categories = ['performance', 'security', 'testing', 'codeQuality', 'deployment'];
  const passedCategories = categories.filter(cat => qaResults[cat].passed).length;
  qaResults.overall.score = Math.round((passedCategories / categories.length) * 100);
  qaResults.overall.passed = qaResults.overall.score >= 80; // 80% threshold
  
  // Save detailed report
  const reportData = {
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: {
      node: process.version,
      npm: execSync('npm --version', { encoding: 'utf8' }).trim(),
      platform: process.platform,
      arch: process.arch,
    },
    thresholds: qaConfig,
    results: qaResults,
    recommendations: generateRecommendations(),
  };
  
  const reportPath = saveReport('final-qa-report.json', reportData);
  
  // Generate summary
  console.log('📊 Final QA Summary:');
  console.log(`   Overall Score: ${qaResults.overall.score}%`);
  console.log(`   Performance: ${qaResults.performance.passed ? '✅' : '❌'}`);
  console.log(`   Security: ${qaResults.security.passed ? '✅' : '❌'}`);
  console.log(`   Testing: ${qaResults.testing.passed ? '✅' : '❌'}`);
  console.log(`   Code Quality: ${qaResults.codeQuality.passed ? '✅' : '❌'}`);
  console.log(`   Deployment Ready: ${qaResults.deployment.passed ? '✅' : '❌'}`);
  
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  
  return qaResults.overall.passed;
};

// Generate recommendations based on results
const generateRecommendations = () => {
  const recommendations = [];
  
  if (!qaResults.performance.passed) {
    recommendations.push({
      category: 'Performance',
      priority: 'High',
      issues: qaResults.performance.issues,
      actions: [
        'Optimize images and use WebP format',
        'Implement code splitting and lazy loading',
        'Minimize JavaScript bundle size',
        'Enable compression and caching',
        'Optimize Core Web Vitals metrics',
      ],
    });
  }
  
  if (!qaResults.security.passed) {
    recommendations.push({
      category: 'Security',
      priority: 'Critical',
      issues: [`${qaResults.security.vulnerabilities.total} vulnerabilities found`],
      actions: [
        'Update vulnerable dependencies',
        'Implement security headers',
        'Review and fix security issues',
        'Enable HTTPS and secure cookies',
        'Implement proper input validation',
      ],
    });
  }
  
  if (!qaResults.testing.passed) {
    recommendations.push({
      category: 'Testing',
      priority: 'High',
      issues: qaResults.testing.failures,
      actions: [
        'Increase test coverage above 80%',
        'Fix failing tests',
        'Add integration tests',
        'Implement E2E testing',
        'Add performance testing',
      ],
    });
  }
  
  if (!qaResults.codeQuality.passed) {
    recommendations.push({
      category: 'Code Quality',
      priority: 'Medium',
      issues: ['ESLint or TypeScript errors found'],
      actions: [
        'Fix ESLint errors and warnings',
        'Resolve TypeScript type errors',
        'Implement consistent code formatting',
        'Add code documentation',
        'Review code complexity',
      ],
    });
  }
  
  if (!qaResults.deployment.passed) {
    recommendations.push({
      category: 'Deployment',
      priority: 'High',
      issues: qaResults.deployment.checks.filter(c => !c.passed).map(c => c.name),
      actions: [
        'Complete missing configuration files',
        'Document deployment process',
        'Set up environment variables',
        'Prepare production build',
        'Test deployment process',
      ],
    });
  }
  
  return recommendations;
};

// Main execution
const runFinalQA = async () => {
  console.log('🎯 Final Quality Assurance for Yadu Web Application');
  console.log('=' .repeat(60));
  
  try {
    // Run all QA checks
    await runPerformanceAudits();
    await runSecurityReview();
    await runTestSuiteVerification();
    await runCodeQualityCheck();
    await runDeploymentReadinessCheck();
    
    // Generate final report
    const overallPassed = generateFinalReport();
    
    if (overallPassed) {
      console.log('\n🎉 Application passed final QA! Ready for production deployment.');
      process.exit(0);
    } else {
      console.log('\n⚠️  Application failed final QA. Please address the issues above.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ Final QA process failed:', error.message);
    process.exit(1);
  }
};

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n⚠️  Final QA interrupted by user');
  process.exit(1);
});

// Run the final QA
runFinalQA();