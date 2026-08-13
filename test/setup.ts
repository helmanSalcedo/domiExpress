import { execSync } from 'child_process';
import * as dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

export const setupTestDatabase = async () => {
  console.log('🔧 Setting up test database...');

  try {
    // Run Prisma migrations for test database
    execSync('npx prisma migrate deploy --skip-generate', {
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL_TEST,
      },
      stdio: 'inherit',
    });

    console.log('✅ Test database ready');
  } catch (error) {
    console.error('❌ Failed to setup test database:', error);
    throw error;
  }
};

export const teardownTestDatabase = async () => {
  console.log('🧹 Cleaning up test database...');

  try {
    // Reset database
    execSync('npx prisma migrate reset --force --skip-generate', {
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL_TEST,
      },
      stdio: 'inherit',
    });

    console.log('✅ Test database cleaned');
  } catch (error) {
    console.error('❌ Failed to cleanup test database:', error);
    // Don't throw - we still want to finish tests
  }
};
