import { FullConfig } from '@playwright/test';
import { db } from '../src/lib/db';
import fs from 'fs';
import path from 'path';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown for E2E tests...');

  try {
    // Clean up test data
    await cleanupTestData();
    console.log('✅ Test data cleanup complete');
  } catch (error) {
    console.error('❌ Failed to cleanup test data:', error);
  }

  try {
    // Clean up auth files
    const authDir = path.join(__dirname, 'auth');
    if (fs.existsSync(authDir)) {
      fs.rmSync(authDir, { recursive: true, force: true });
    }
    console.log('✅ Auth files cleanup complete');
  } catch (error) {
    console.error('❌ Failed to cleanup auth files:', error);
  }

  try {
    // Disconnect from database
    await db.$disconnect();
    console.log('✅ Database disconnection complete');
  } catch (error) {
    console.error('❌ Failed to disconnect from database:', error);
  }

  console.log('🎉 Global teardown completed successfully');
}

async function cleanupTestData() {
  // Clean up test data in reverse dependency order
  try {
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
    
    await db.portfolioItem.deleteMany({
      where: {
        title: { contains: 'Test' }
      }
    });
    
    await db.user.deleteMany({
      where: {
        email: { contains: 'test' }
      }
    });
  } catch (error) {
    console.error('Error during test data cleanup:', error);
    // Don't throw here, as we want teardown to continue
  }
}

export default globalTeardown;