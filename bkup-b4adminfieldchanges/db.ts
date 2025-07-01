// lib/db.ts
import mysql from 'mysql2/promise'

export const pool = mysql.createPool({
  host: 'localhost',          // your MySQL server host
  user: 'your_mysql_user',    // your MySQL username
  password: 'your_mysql_password',  // your MySQL password
  database: 'job_portal',     // your database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})
export default pool