// setup/setupdb.ts
import { createConnection, Connection } from 'mysql2/promise';
import getDatabaseRootConfig from './config/database.root.config';
import getDatabaseConfig from '../src/config/configs/database.config';
import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';
import * as fs from 'fs';

const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = `.env.${nodeEnv}`;

if (fs.existsSync(envFile)) {
    const envConfig = dotenv.config({ path: envFile });
    dotenvExpand.expand(envConfig);
    console.log(`Loaded configuration from ${envFile}`);
} else {
    console.warn(`Environment file ${envFile} not found. Using default environment variables.`);
}

const rootEnvFile = '.env.database.root';

if (fs.existsSync(rootEnvFile)) {
    const rootEnvConfig = dotenv.config({ path: rootEnvFile });
    dotenvExpand.expand(rootEnvConfig);
    console.log(`Loaded root configuration from ${rootEnvFile}`);
} else {
    console.warn(`Root environment file ${rootEnvFile} not found. Using default environment variables.`);
}

async function createDatabase(
    connection: Connection,
    dbName: string,
): Promise<void> {
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`Database "${dbName}" created successfully.`);
}

async function createUser(
    connection: Connection,
    username: string,
    password: string,
): Promise<void> {
    await connection.query(
        `CREATE USER IF NOT EXISTS '${username}'@'%' IDENTIFIED BY '${password}'`,
    );
    console.log(`User "${username}" created successfully.`);
}

async function grantPrivileges(
    connection: Connection,
    dbName: string,
    username: string,
): Promise<void> {
    await connection.query(
        `GRANT ALL PRIVILEGES ON \`${dbName}\`.* TO '${username}'@'%'`,
    );
    console.log(
        `Privileges granted to user "${username}" for database "${dbName}"`,
    );
}

async function configureMainDatabase(connection: Connection): Promise<string> {
    const config = getDatabaseConfig();
    const shadowDbName = config.database.shadow.name;

    console.log('Setting up main databases...');
    await createDatabase(connection, config.database.app.name);
    await createDatabase(connection, shadowDbName);

    await createUser(
        connection,
        config.database.app.username,
        config.database.app.password,
    );

    await grantPrivileges(
        connection,
        config.database.app.name,
        config.database.app.username,
    );

    await grantPrivileges(
        connection,
        shadowDbName,
        config.database.app.username
    );

    console.log('Main databases setup completed successfully.');
    return config.database.app.username;
}

async function configureTestDatabase(
    connection: Connection,
    appUsername: string,
): Promise<void> {
    const testEnvFile = '.env.test';
    if (!fs.existsSync(testEnvFile)) {
        console.log(
            'Test environment file not found, skipping test database setup.',
        );
        return;
    }

    const testEnv = dotenv.parse(fs.readFileSync(testEnvFile));
    const testDbName = testEnv.DB_APP_DATABASE;

    if (!testDbName) {
        console.log(
            'Test database name not found in test configuration, skipping test database setup.',
        );
        return;
    }

    console.log(`Setting up test database "${testDbName}"...`);

    await createDatabase(connection, testDbName);
    await grantPrivileges(connection, testDbName, appUsername);

    console.log(`Test database "${testDbName}" setup completed successfully.`);
}

async function setupDatabase(): Promise<void> {
    let connection: Connection | null = null;

    try {
        const rootConfig = getDatabaseRootConfig();
        connection = await createConnection({
            host: rootConfig.host,
            port: rootConfig.port,
            user: rootConfig.user,
            password: rootConfig.password,
        });

        const appUsername = await configureMainDatabase(connection);

        await configureTestDatabase(connection, appUsername);

        await connection.query(`FLUSH PRIVILEGES`);
        console.log('All privileges have been flushed successfully.');
    } catch (error) {
        console.error('Database setup error:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

setupDatabase().catch((error) => {
    console.error('Failed to setup database:', error);
    process.exit(1);
});
