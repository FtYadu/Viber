const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Running comprehensive test suite...\n');

// Test configuration
const testCommands = [
  {
    name: 'Unit Tests',
    command: 'npm run test -- --coverage --watchAll=false',
    description: 'Running unit tests with coverage',
  },
  {
    name: 'Integration Tests',
    command: 'npm run test -- tests/integration --watchAll=false',
    description: 'Running integration tests',
  },
  {
    name: 'Security Tests',
    command: 'npm run test -- tests/security --watchAll=false',
    description: 'Running security tests',
  },
  {
    name: 'Lint Check',
    command: 'npm run lint',
    description: 'Running ESLint checks',
  },
  {
    name: 'Type Check',
    command: 'npx tsc --noEmit',
    description: 'Running TypeScript type checks',
  },
];

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const results = [];

// Run each test suite
for (const test of testCommands) {
  console.log(`📋 ${test.description}...`);
  
  try {
    const startTime = Date.now();
    const output = execSync(test.command, { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    const duration = Date.now() - startTime;
    
    console.log(`✅ ${test.name} passed (${duration}ms)`);
    
    // Parse Jest output for test counts
    if (output.includes('Tests:')) {
      const testMatch = output.match(/Tests:\s+(\d+)\s+passed/);
      if (testMatch) {
        const passed = parseInt(testMatch[1]);
        passedTests += passed;
        totalTests += passed;
      }
    }
    
    results.push({
      name: test.name,
      status: 'passed',
      duration,
      output: output.substring(0, 500), // Truncate long output
    });
    
  } catch (error) {
    console.log(`❌ ${test.name} failed`);
    console.log(error.stdout || error.message);
    
    failedTests++;
    totalTests++;
    
    results.push({
      name: test.name,
      status: 'failed',
      error: error.message,
      output: error.stdout || error.stderr,
    });
  }
  
  console.log(''); // Empty line for readability
}

// Generate test report
console.log('📊 Test Summary:');
console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests}`);
console.log(`Success Rate: ${totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}%`);

// Check coverage
const coverageDir = path.join(__dirname, '../coverage');
if (fs.existsSync(coverageDir)) {
  try {
    const coverageFile = path.join(coverageDir, 'coverage-summary.json');
    if (fs.existsSync(coverageFile)) {
      const coverage = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
      const totalCoverage = coverage.total;
      
      console.log('\n📈 Coverage Summary:');
      console.log(`Lines: ${totalCoverage.lines.pct}%`);
      console.log(`Functions: ${totalCoverage.functions.pct}%`);
      console.log(`Branches: ${totalCoverage.branches.pct}%`);
      console.log(`Statements: ${totalCoverage.statements.pct}%`);
      
      // Check if coverage meets threshold
      const threshold = 70; // 70% minimum coverage
      const meetsThreshold = totalCoverage.lines.pct >= threshold;
      
      if (meetsThreshold) {
        console.log(`✅ Coverage meets minimum threshold (${threshold}%)`);
      } else {
        console.log(`❌ Coverage below minimum threshold (${threshold}%)`);
        failedTests++;
      }
    }
  } catch (error) {
    console.log('⚠️  Could not read coverage report');
  }
}

// Generate detailed report
const reportData = {
  timestamp: new Date().toISOString(),
  summary: {
    total: totalTests,
    passed: passedTests,
    failed: failedTests,
    successRate: totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0,
  },
  results,
};

const reportPath = path.join(__dirname, '../test-report.json');
fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
console.log(`\n📄 Detailed report saved to ${reportPath}`);

// Exit with appropriate code
if (failedTests > 0) {
  console.log('\n❌ Some tests failed. Please review the output above.');
  process.exit(1);
} else {
  console.log('\n✅ All tests passed successfully!');
  process.exit(0);
}