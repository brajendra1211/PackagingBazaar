import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Connection test
pool.getConnection()
    .then(() => console.log('✅ MySQL Database Connected Successfully'))
    .catch((err) => console.error('❌ Database Connection Failed:', err.message));

// module.exports ki jagah export default
export default pool;