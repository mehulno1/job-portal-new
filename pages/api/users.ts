// pages/api/users.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import mysql from 'mysql2/promise'

// Configure your MySQL connection (update with your credentials)
const dbConfig = {
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'job_portal',
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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
