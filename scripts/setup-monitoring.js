const fs = require('fs');
const path = require('path');

// UptimeRobot API configuration
const UPTIMEROBOT_API_KEY = process.env.UPTIMEROBOT_API_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://yadukrishnan.com';

// Monitors to create
const monitors = [
  {
    friendly_name: 'Main Website',
    url: BASE_URL,
    type: 1, // HTTP(s)
    interval: 300, // 5 minutes
  },
  {
    friendly_name: 'Admin Panel',
    url: `${BASE_URL}/admin`,
    type: 1,
    interval: 300,
  },
  {
    friendly_name: 'API Health Check',
    url: `${BASE_URL}/api/health`,
    type: 1,
    interval: 300,
  },
  {
    friendly_name: 'Portfolio Page',
    url: `${BASE_URL}/portfolio`,
    type: 1,
    interval: 600, // 10 minutes
  },
];

async function createUptimeRobotMonitors() {
  if (!UPTIMEROBOT_API_KEY) {
    console.error('❌ UPTIMEROBOT_API_KEY environment variable is required');
    console.log('Please set your UptimeRobot API key:');
    console.log('export UPTIMEROBOT_API_KEY="your-api-key-here"');
    process.exit(1);
  }

  console.log('🚀 Setting up UptimeRobot monitors...');

  for (const monitor of monitors) {
    try {
      const response = await fetch('https://api.uptimerobot.com/v2/newMonitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          api_key: UPTIMEROBOT_API_KEY,
          format: 'json',
          ...monitor,
        }),
      });

      const result = await response.json();

      if (result.stat === 'ok') {
        console.log(`✅ Created monitor: ${monitor.friendly_name}`);
      } else {
        console.error(`❌ Failed to create monitor ${monitor.friendly_name}:`, result.error);
      }
    } catch (error) {
      console.error(`❌ Error creating monitor ${monitor.friendly_name}:`, error.message);
    }
  }

  console.log('\n📊 Monitor setup complete!');
  console.log('Visit https://uptimerobot.com/dashboard to view your monitors.');
}

async function generateStatusPageConfig() {
  const statusPageConfig = {
    title: 'Yadu Krishnan - System Status',
    description: 'Real-time status of Yadu Krishnan\'s portfolio and business platform',
    monitors: monitors.map(monitor => ({
      name: monitor.friendly_name,
      url: monitor.url,
    })),
    contact: {
      email: 'admin@yadukrishnan.com',
      twitter: '@yadukrishnan',
    },
  };

  const configPath = path.join(__dirname, '../public/status-config.json');
  fs.writeFileSync(configPath, JSON.stringify(statusPageConfig, null, 2));
  
  console.log('📄 Generated status page configuration at public/status-config.json');
}

async function main() {
  console.log('🔧 Setting up monitoring and analytics...\n');

  // Create UptimeRobot monitors
  await createUptimeRobotMonitors();

  // Generate status page configuration
  await generateStatusPageConfig();

  console.log('\n✨ Monitoring setup complete!');
  console.log('\nNext steps:');
  console.log('1. Configure your Sentry project at https://sentry.io');
  console.log('2. Set up Vercel Analytics in your Vercel dashboard');
  console.log('3. Create a public status page using the generated config');
  console.log('4. Set up alert contacts in UptimeRobot');
}

// Run the setup if this script is executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  createUptimeRobotMonitors,
  generateStatusPageConfig,
};