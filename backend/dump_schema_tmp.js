import pool from './config/db.js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

async function dumpSchema() {
    try {
        const [tables] = await pool.query('SHOW TABLES');
        const tableNames = tables.map(t => Object.values(t)[0]);
        const schema = {};

        for (const tableName of tableNames) {
            const [columns] = await pool.query(`DESCRIBE \`${tableName}\``);
            schema[tableName] = columns.map(c => ({
                name: c.Field,
                type: c.Type,
                null: c.Null,
                key: c.Key,
                default: c.Default,
                extra: c.Extra
            }));
        }

        fs.writeFileSync('schema_dump.json', JSON.stringify(schema, null, 2));
        console.log('✅ Schema dumped to schema_dump.json');
    } catch (error) {
        console.error('Error dumping schema:', error);
    } finally {
        process.exit(0);
    }
}

dumpSchema();
