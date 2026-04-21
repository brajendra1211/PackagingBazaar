import pool from './config/db.js';

async function audit() {
  try {
    const [tables] = await pool.query("SHOW TABLES");
    console.log("--- TABLE STRUCTURES ---");

    for (let t of tables) {
      const tableName = Object.values(t)[0];
      const [cols] = await pool.query(`DESCRIBE ${tableName}`);
      console.log(`\n\n[TABLE: ${tableName}]`);
      cols.forEach(c => {
        console.log(`${c.Field} | ${c.Type} | ${c.Null} | ${c.Key}`);
      });
    }
  } catch (err) {
    console.error("Audit failed:", err);
  } finally {
    process.exit();
  }
}

audit();
