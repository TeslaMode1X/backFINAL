const fs = require('fs');
const path = require('path');

const migrationsDir = '/migrations';
const files = fs.readdirSync(migrationsDir).sort();

const BATCH_SIZE = 100; // Reduced batch size to avoid exceeding limits

async function runMigrations() {
    try {
        for (const file of files) {
            if (file.endsWith('.json')) {
                const filePath = path.join(migrationsDir, file);
                const migration = JSON.parse(fs.readFileSync(filePath, 'utf8'));

                if (migration.operation === 'createCollection') {
                    print(`Creating collection: ${migration.collection}`);
                    await db.createCollection(migration.collection);
                } 
                else if (migration.operation === 'insertMany' && migration.data) {
                    print(`Inserting data into collection: ${migration.collection}`);

                    // Вставляем данные партиями
                    const data = migration.data;
                    for (let i = 0; i < data.length; i += BATCH_SIZE) {
                        const batch = data.slice(i, i + BATCH_SIZE);
                        print(`Inserting batch from ${i + 1} to ${i + batch.length}`);

                        try {
                            await db.getCollection(migration.collection).insertMany(batch);
                            print(`Successfully inserted batch from ${i + 1} to ${i + batch.length}`);
                        } catch (insertError) {
                            print(`Error inserting batch from ${i + 1} to ${i + batch.length}: ${insertError.message}`);
                        }
                    }
                }
            }
        }
        print("All migrations completed successfully!");
    } catch (error) {
        print("Error during migration: " + error.message);
        throw error;
    }
}

runMigrations().catch(error => {
    print("Failed to run migrations: " + error.message);
    process.exit(0);
});
