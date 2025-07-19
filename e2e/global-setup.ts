import { chromium, FullConfig } from '@playwright/test';
import { db } from '../src/lib/db';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup for E2E tests...');

  // Set up test database
  try {
    // Clean up existing test data
    await cleanupTestData();
    
    // Seed test data
    await seedTestData();
    
    console.log('✅ Test database setup complete');
  } catch (error) {
    console.error('❌ Failed to setup test database:', error);
    throw error;
  }

  // Authenticate users and save auth states
  const browser = await chromium.launch();
  
  try {
    // Admin authentication
    await setupAdminAuth(browser);
    
    // Client authentication
    await setupClientAuth(browser);
    
    console.log('✅ Authentication setup complete');
  } catch (error) {
    console.error('❌ Failed to setup authentication:', error);
    throw error;
  } finally {
    await browser.close();
  }

  console.log('🎉 Global setup completed successfully');
}

async function cleanupTestData() {
  // Clean up test data in reverse dependency order
  await db.chatMessage.deleteMany({
    where: {
      session: {
        ipAddress: { contains: 'test' }
      }
    }
  });
  
  await db.chatSession.deleteMany({
    where: {
      ipAddress: { contains: 'test' }
    }
  });
  
  await db.projectFile.deleteMany({
    where: {
      project: {
        client: {
          email: { contains: 'test' }
        }
      }
    }
  });
  
  await db.task.deleteMany({
    where: {
      project: {
        client: {
          email: { contains: 'test' }
        }
      }
    }
  });
  
  await db.project.deleteMany({
    where: {
      client: {
        email: { contains: 'test' }
      }
    }
  });
  
  await db.client.deleteMany({
    where: {
      email: { contains: 'test' }
    }
  });
  
  await db.user.deleteMany({
    where: {
      email: { contains: 'test' }
    }
  });
}

async function seedTestData() {
  // Create test admin user
  const adminUser = await db.user.create({
    data: {
      name: 'Test Admin',
      email: 'admin@test.com',
      role: 'ADMIN',
    },
  });

  // Create test client user
  const clientUser = await db.user.create({
    data: {
      name: 'Test Client',
      email: 'client@test.com',
      role: 'CLIENT',
    },
  });

  // Create test client
  const testClient = await db.client.create({
    data: {
      name: 'Test Client Company',
      email: 'client@test.com',
      company: 'Test Company Inc.',
      phone: '+1-555-0123',
      address: '123 Test Street, Test City, TC 12345',
      status: 'ACTIVE',
      userId: clientUser.id,
    },
  });

  // Create test projects
  await db.project.create({
    data: {
      title: 'Test Project 1',
      description: 'This is a test project for E2E testing',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      startDate: new Date(),
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      budget: 5000,
      tags: ['web', 'development', 'test'],
      clientId: testClient.id,
    },
  });

  await db.project.create({
    data: {
      title: 'Test Project 2',
      description: 'Another test project for E2E testing',
      status: 'PLANNING',
      priority: 'MEDIUM',
      startDate: new Date(),
      tags: ['mobile', 'app', 'test'],
      clientId: testClient.id,
    },
  });

  // Create test portfolio items
  await db.portfolioItem.create({
    data: {
      title: 'Test Portfolio Item 1',
      description: 'A test portfolio item for E2E testing',
      category: 'Web Development',
      tags: ['React', 'Next.js', 'TypeScript'],
      images: ['/images/test-portfolio-1.jpg'],
      liveUrl: 'https://example.com/project1',
      githubUrl: 'https://github.com/test/project1',
      featured: true,
      order: 1,
    },
  });

  await db.portfolioItem.create({
    data: {
      title: 'Test Portfolio Item 2',
      description: 'Another test portfolio item for E2E testing',
      category: 'Mobile Development',
      tags: ['React Native', 'iOS', 'Android'],
      images: ['/images/test-portfolio-2.jpg'],
      liveUrl: 'https://example.com/project2',
      featured: false,
      order: 2,
    },
  });
}

async function setupAdminAuth(browser: any) {
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Navigate to login page
  await page.goto('/auth/login');
  
  // Perform login (this would depend on your auth implementation)
  // For now, we'll simulate the auth state
  await page.evaluate(() => {
    // Mock the session in localStorage or cookies
    localStorage.setItem('test-admin-session', JSON.stringify({
      user: {
        id: '1',
        name: 'Test Admin',
        email: 'admin@test.com',
        role: 'ADMIN',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }));
  });
  
  // Save authenticated state
  await context.storageState({ path: 'e2e/auth/admin.json' });
  await context.close();
}

async function setupClientAuth(browser: any) {
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Navigate to login page
  await page.goto('/auth/login');
  
  // Perform login for client
  await page.evaluate(() => {
    localStorage.setItem('test-client-session', JSON.stringify({
      user: {
        id: '2',
        name: 'Test Client',
        email: 'client@test.com',
        role: 'CLIENT',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }));
  });
  
  // Save authenticated state
  await context.storageState({ path: 'e2e/auth/client.json' });
  await context.close();
}

export default globalSetup;