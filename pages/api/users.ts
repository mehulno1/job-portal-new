// pages/api/users.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import mysql from 'mysql2/promise'

// Configure your MySQL connection (update with your credentials)
const dbConfig = {
  host: '127.0.0.1',
  user: 'dbusr_dcjobs',
  password: 'dc@123',
  database: 'job_portal',
  port: 3307
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 
  {
  try {
    const connection = await mysql.createConnection(dbConfig)
    const [rows] = await connection.execute('SELECT id, name FROM user')
    await connection.end()

    res.status(200).json(rows)
  } catch (error) {
    console.error('Failed to fetch users:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}
}
