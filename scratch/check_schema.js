const pool = require('../backend/config/db.js');

async function checkSchema() {
    try {
        const [inquiryCols] = await pool.query('SHOW COLUMNS FROM inquiries');
        console.log('--- Inquiries Table ---');
        console.table(inquiryCols.map(c => ({ Field: c.Field, Type: c.Type })));

        const [tables] = await pool.query('SHOW TABLES');
        console.log('--- All Tables ---');
        console.log(tables);

    } catch (error) {
        console.error('Error checking schema:', error);
    } finally {
        process.exit(0);
    }
}

checkSchema();
