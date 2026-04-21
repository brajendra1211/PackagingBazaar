import dotenv from 'dotenv';
dotenv.config({ path: '../backend/.env' });
import pool from '../backend/config/db.js';

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

        console.log(JSON.stringify(schema, null, 2));
    } catch (error) {
        console.error('Error dumping schema:', error);
    } finally {
        process.exit(0);
    }
}

dumpSchema();
