// test/global.setup.ts
import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';
import { resolve } from 'path';
import { execSync } from 'child_process';

const envPath = resolve(process.cwd(), '.env.test');

export function loadEnvironment() {
    const mainEnv = dotenv.config({ path: envPath });
    dotenvExpand.expand(mainEnv);
}

export function generatePrismaClient() {
    try {
        console.log('📦 Generating Prisma client...');
        execSync('npx prisma generate', { stdio: 'inherit' });
        console.log('✅ Prisma client generated successfully');
    } catch (error) {
        console.error('❌ Failed to generate Prisma client:', error);
        process.exit(1);
    }
}

export function resetTestDatabase() {
    try {
        console.log('🚀 Setting up test database...');
        execSync('npx prisma migrate reset --force', {
            env: process.env,
            stdio: 'inherit',
        });
        console.log('✅ Test database successfully prepared');
    } catch (error) {
        console.error('❌ Error setting up test database:', error);
        throw error;
    }
}
