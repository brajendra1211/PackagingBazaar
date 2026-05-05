import pool from '../config/db.js';

async function dumpSchema() {
  try {
    const [tables] = await pool.query('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);
    
    console.log('# Current Database Schema\n');
    
    for (const tableName of tableNames) {
      console.log(`## Table: ${tableName}`);
      const [columns] = await pool.query(`DESCRIBE ${tableName}`);
      console.table(columns.map(c => ({
        Field: c.Field,
        Type: c.Type,
        Null: c.Null,
        Key: c.Key,
        Default: c.Default,
        Extra: c.Extra
      })));
      console.log('\n');
    }
    process.exit(0);
  } catch (error) {
    console.error('Error fetching schema:', error);
    process.exit(1);
  }
}

dumpSchema();
