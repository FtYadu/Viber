const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Deployment Readiness Check for Yadu Web Application\n');

let deploymentScore = 0;
let totalChecks = 0;
const issues = [];
const recommendations = [];

// Utility function to run commands safely
const runCommand = (command, description, options = {}) => {
  console.log(`🔧 ${description}...`);
  try {
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options 
    });
    console.log(`✅ ${description} - PASSED`);
    return { success: true, output: result };
  } catch (error) {
    console.log(`❌ ${description} - FAILED`);
    if (!options.silent && error.stdout) {
      console.log(error.stdout);
    }
    return { success: false, error: error.message, output: error.stdout || error.stderr };
  }
};

// Check if file exists
const checkFile = (filePath, description) => {
  totalChecks++;
  const exists = fs.existsSync(filePath);
  if (exists) {
    console.log(`✅ ${description} - EXISTS`);
    deploymentScore++;
  } else {
    console.log(`❌ ${description} - MISSING`);
    issues.push(`Missing file: ${filePath}`);
  }
  return exists;
};

// Check package.json scripts
const checkPackageScripts = () => {
  console.log('\n📦 Checking Package Configuration...');
  
  const packageJsonPath = path.join(__dirname, '../package.json');
  if (!checkFile(packageJsonPath, 'package.json')) {
    return false;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const requiredScripts = ['build', 'start', 'dev', 'lint', 'test'];
  
  requiredScripts.forEach(script => {
    totalChecks++;
    if (packageJson.scripts && packageJson.scripts[script]) {
      console.log(`✅ Script '${script}' - EXISTS`);
      deploymentScore++;
    } else {
      console.log(`❌ Script '${script}' - MISSING`);
      issues.push(`Missing npm script: ${script}`);
    }
  });
  
  return true;
};

// Check environment configuration
const checkEnvironmentConfig = () => {
  console.log('\n🔧 Checking Environment Configuration...');
  
  checkFile('.env.example', 'Environment example file');
  
  // Check if .env exists (optional for deployment)
  const envExists = fs.existsSync('.env');
  if (envExists) {
    console.log('✅ Local .env file - EXISTS');
  } else {
    console.log('⚠️  Local .env file - NOT FOUND (OK for production)');
  }
  
  // Check environment variables in .env.example
  if (fs.existsSync('.env.example')) {
    const envExample = fs.readFileSync('.env.example', 'utf8');
    const requiredVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET'
    ];
    
    requiredVars.forEach(varName => {
      totalChecks++;
      if (envExample.includes(varName)) {
        console.log(`✅ Environment variable '${varName}' - DOCUMENTED`);
        deploymentScore++;
      } else {
        console.log(`❌ Environment variable '${varName}' - NOT DOCUMENTED`);
        issues.push(`Missing environment variable documentation: ${varName}`);
      }
    });
  }
};

// Check Next.js configuration
const checkNextConfig = () => {
  console.log('\n⚙️  Checking Next.js Configuration...');
  
  const nextConfigExists = checkFile('next.config.js', 'Next.js configuration') ||
                          checkFile('next.config.ts', 'Next.js TypeScript configuration');
  
  if (nextConfigExists) {
    // Check for production optimizations
    const configPath = fs.existsSync('next.config.js') ? 'next.config.js' : 'next.config.ts';
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    const optimizations = [
      { name: 'Image optimization', check: configContent.includes('images') },
      { name: 'Bundle analyzer', check: configContent.includes('analyzer') || configContent.includes('ANALYZE') },
      { name: 'Compression', check: configContent.includes('compress') || configContent.includes('gzip') },
    ];
    
    optimizations.forEach(opt => {
      totalChecks++;
      if (opt.check) {
        console.log(`✅ ${opt.name} - CONFIGURED`);
        deploymentScore++;
      } else {
        console.log(`⚠️  ${opt.name} - NOT CONFIGURED`);
        recommendations.push(`Consider configuring ${opt.name.toLowerCase()}`);
      }
    });
  }
};

// Check database configuration
const checkDatabaseConfig = () => {
  console.log('\n🗄️  Checking Database Configuration...');
  
  checkFile('prisma/schema.prisma', 'Prisma schema');
  
  // Check if migrations exist
  const migrationsDir = 'prisma/migrations';
  totalChecks++;
  if (fs.existsSync(migrationsDir) && fs.readdirSync(migrationsDir).length > 0) {
    console.log('✅ Database migrations - EXIST');
    deploymentScore++;
  } else {
    console.log('❌ Database migrations - MISSING');
    issues.push('No database migrations found');
    recommendations.push('Run: npx prisma migrate dev --name init');
  }
  
  // Check if Prisma client is generated
  const prismaClientPath = 'node_modules/.prisma/client';
  totalChecks++;
  if (fs.existsSync(prismaClientPath)) {
    console.log('✅ Prisma client - GENERATED');
    deploymentScore++;
  } else {
    console.log('❌ Prisma client - NOT GENERATED');
    issues.push('Prisma client not generated');
    recommendations.push('Run: npx prisma generate');
  }
};

// Check TypeScript configuration
const checkTypeScriptConfig = () => {
  console.log('\n📝 Checking TypeScript Configuration...');
  
  checkFile('tsconfig.json', 'TypeScript configuration');
  checkFile('next-env.d.ts', 'Next.js TypeScript declarations');
  
  // Try to run TypeScript check (but don't fail if there are errors)
  totalChecks++;
  const tsResult = runCommand('npx tsc --noEmit --skipLibCheck', 'TypeScript type checking', { silent: true });
  if (tsResult.success) {
    console.log('✅ TypeScript compilation - NO ERRORS');
    deploymentScore++;
  } else {
    console.log('⚠️  TypeScript compilation - HAS ERRORS');
    recommendations.push('Fix TypeScript errors before deployment');
  }
};

// Check build process
const checkBuildProcess = () => {
  console.log('\n🏗️  Checking Build Process...');
  
  // Try to build the application
  totalChecks++;
  console.log('🔧 Testing production build...');
  const buildResult = runCommand('npm run build', 'Production build test', { silent: false });
  
  if (buildResult.success) {
    console.log('✅ Production build - SUCCESS');
    deploymentScore++;
    
    // Check if build output exists
    totalChecks++;
    if (fs.existsSync('.next')) {
      console.log('✅ Build output - EXISTS');
      deploymentScore++;
    } else {
      console.log('❌ Build output - MISSING');
      issues.push('Build output directory not found');
    }
  } else {
    console.log('❌ Production build - FAILED');
    issues.push('Production build failed');
    recommendations.push('Fix build errors before deployment');
  }
};

// Check security configuration
const checkSecurityConfig = () => {
  console.log('\n🔒 Checking Security Configuration...');
  
  // Check for security-related files
  const securityFiles = [
    { path: '.gitignore', desc: 'Git ignore file' },
    { path: '.env.example', desc: 'Environment example (security template)' },
  ];
  
  securityFiles.forEach(file => {
    checkFile(file.path, file.desc);
  });
  
  // Check if sensitive files are properly ignored
  if (fs.existsSync('.gitignore')) {
    const gitignore = fs.readFileSync('.gitignore', 'utf8');
    const sensitivePatterns = ['.env', 'node_modules', '.next'];
    
    sensitivePatterns.forEach(pattern => {
      totalChecks++;
      if (gitignore.includes(pattern)) {
        console.log(`✅ Gitignore pattern '${pattern}' - CONFIGURED`);
        deploymentScore++;
      } else {
        console.log(`❌ Gitignore pattern '${pattern}' - MISSING`);
        issues.push(`Missing gitignore pattern: ${pattern}`);
      }
    });
  }
  
  // Check for npm audit
  totalChecks++;
  const auditResult = runCommand('npm audit --audit-level=high', 'Security vulnerability check', { silent: true });
  if (auditResult.success) {
    console.log('✅ Security audit - NO HIGH/CRITICAL VULNERABILITIES');
    deploymentScore++;
  } else {
    console.log('⚠️  Security audit - VULNERABILITIES FOUND');
    recommendations.push('Run: npm audit fix to address security vulnerabilities');
  }
};

// Check documentation
const checkDocumentation = () => {
  console.log('\n📚 Checking Documentation...');
  
  checkFile('README.md', 'README documentation');
  
  // Check README content
  if (fs.existsSync('README.md')) {
    const readme = fs.readFileSync('README.md', 'utf8');
    const sections = [
      { name: 'Installation', check: readme.toLowerCase().includes('install') },
      { name: 'Usage', check: readme.toLowerCase().includes('usage') || readme.toLowerCase().includes('getting started') },
      { name: 'Environment', check: readme.toLowerCase().includes('environment') || readme.toLowerCase().includes('env') },
    ];
    
    sections.forEach(section => {
      totalChecks++;
      if (section.check) {
        console.log(`✅ README section '${section.name}' - EXISTS`);
        deploymentScore++;
      } else {
        console.log(`⚠️  README section '${section.name}' - MISSING`);
        recommendations.push(`Add ${section.name.toLowerCase()} section to README`);
      }
    });
  }
};

// Check deployment files
const checkDeploymentFiles = () => {
  console.log('\n🚀 Checking Deployment Configuration...');
  
  // Check for common deployment files
  const deploymentFiles = [
    { path: 'vercel.json', desc: 'Vercel configuration', platform: 'Vercel' },
    { path: 'Dockerfile', desc: 'Docker configuration', platform: 'Docker' },
    { path: '.dockerignore', desc: 'Docker ignore file', platform: 'Docker' },
    { path: 'netlify.toml', desc: 'Netlify configuration', platform: 'Netlify' },
  ];
  
  let hasDeploymentConfig = false;
  deploymentFiles.forEach(file => {
    if (fs.existsSync(file.path)) {
      console.log(`✅ ${file.desc} - EXISTS (${file.platform})`);
      hasDeploymentConfig = true;
    }
  });
  
  totalChecks++;
  if (hasDeploymentConfig) {
    console.log('✅ Deployment configuration - FOUND');
    deploymentScore++;
  } else {
    console.log('⚠️  Deployment configuration - NOT FOUND');
    recommendations.push('Add deployment configuration (vercel.json, Dockerfile, etc.)');
  }
};

// Generate final report
const generateReport = () => {
  console.log('\n' + '='.repeat(60));
  console.log('📊 DEPLOYMENT READINESS REPORT');
  console.log('='.repeat(60));
  
  const percentage = Math.round((deploymentScore / totalChecks) * 100);
  
  console.log(`\n🎯 Overall Score: ${deploymentScore}/${totalChecks} (${percentage}%)`);
  
  if (percentage >= 90) {
    console.log('🟢 Status: EXCELLENT - Ready for production deployment');
  } else if (percentage >= 75) {
    console.log('🟡 Status: GOOD - Minor issues to address');
  } else if (percentage >= 60) {
    console.log('🟠 Status: FAIR - Several issues need attention');
  } else {
    console.log('🔴 Status: POOR - Major issues must be resolved');
  }
  
  if (issues.length > 0) {
    console.log('\n❌ CRITICAL ISSUES TO FIX:');
    issues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue}`);
    });
  }
  
  if (recommendations.length > 0) {
    console.log('\n💡 RECOMMENDATIONS:');
    recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
  }
  
  // Save report to file
  const report = {
    timestamp: new Date().toISOString(),
    score: {
      points: deploymentScore,
      total: totalChecks,
      percentage: percentage,
    },
    status: percentage >= 90 ? 'EXCELLENT' : percentage >= 75 ? 'GOOD' : percentage >= 60 ? 'FAIR' : 'POOR',
    issues: issues,
    recommendations: recommendations,
  };
  
  const reportPath = path.join(__dirname, '../deployment-readiness-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  
  return percentage >= 75; // Return true if deployment ready
};

// Main execution
const runDeploymentCheck = async () => {
  try {
    checkPackageScripts();
    checkEnvironmentConfig();
    checkNextConfig();
    checkDatabaseConfig();
    checkTypeScriptConfig();
    checkBuildProcess();
    checkSecurityConfig();
    checkDocumentation();
    checkDeploymentFiles();
    
    const isReady = generateReport();
    
    if (isReady) {
      console.log('\n🎉 Application is ready for deployment!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Application needs improvements before deployment.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ Deployment readiness check failed:', error.message);
    process.exit(1);
  }
};

// Run the deployment check
runDeploymentCheck();