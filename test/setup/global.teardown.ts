// test/global.teardown.ts
export default async (): Promise<void> => {
    console.log('🧹 Cleaning up test environment...');

    await new Promise(resolve => setTimeout(resolve, 500));

    process.exit(0);
};
