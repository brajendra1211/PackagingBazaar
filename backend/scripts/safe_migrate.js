import fs from 'fs';
import pool from '../config/db.js';
import path from 'path';

async function safeMigrate() {
  const sqlFilePath = path.join(process.cwd(), 'packagingbazaar_db.sql');
  
  try {
    console.log('Reading SQL dump file...');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split by lines to process safely
    const lines = sqlContent.split('\n');
    let insertQueries = [];
    
    console.log('Extracting and transforming INSERT statements...');
    
    // Simple state machine for multi-line inserts
    let currentQuery = '';
    let inQuery = false;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      
      // Ignore comments and empty lines
      if (line.startsWith('--') || line.startsWith('/*') || line === '') continue;
      
      // Check if line starts an INSERT statement
      if (line.startsWith('INSERT INTO')) {
        inQuery = true;
        // Transform INSERT INTO to INSERT IGNORE INTO
        currentQuery = line.replace('INSERT INTO', 'INSERT IGNORE INTO');
      } else if (inQuery) {
        currentQuery += '\n' + line;
      }
      
      // Check if query ends
      if (inQuery && currentQuery.endsWith(';')) {
        insertQueries.push(currentQuery);
        inQuery = false;
        currentQuery = '';
      }
    }
    
    console.log(`Found ${insertQueries.length} valid INSERT statements.`);
    
    if (insertQueries.length === 0) {
      console.log('No data to insert. Exiting.');
      process.exit(0);
    }

    console.log('Executing queries safely...');
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < insertQueries.length; i++) {
      try {
        const [result] = await pool.query(insertQueries[i]);
        console.log(`[Query ${i+1}/${insertQueries.length}] Executed successfully. Affected Rows: ${result.affectedRows}`);
        successCount++;
      } catch (err) {
        console.error(`[Query ${i+1}/${insertQueries.length}] Error:`, err.message);
        errorCount++;
      }
    }

    console.log('\\n--- MIGRATION COMPLETE ---');
    console.log(`Successful Executions: ${successCount}`);
    console.log(`Errors (usually skipped constraints): ${errorCount}`);
    console.log('Note: Affected Rows = 0 means the data was already present (Ignored safely).');
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

safeMigrate();
