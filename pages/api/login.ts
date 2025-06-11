import type { NextApiRequest, NextApiResponse } from 'next'
import mysql from 'mysql2/promise'

// Log MySQL credentials for debugging (don't use in production)
console.log('MYSQL_USER:', process.env.MYSQL_USER)
console.log('MYSQL_PASSWORD:', process.env.MYSQL_PASSWORD)

// Setup MySQL connection pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
})

type Data =
  | { role: string }
  | { message: string }

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { mobile_no } = req.body

  if (!mobile_no) {
    return res.status(400).json({ message: 'Mobile number is required' })
  }

  try {
    const [rows] = await pool.query(
      'SELECT role FROM user WHERE mobile_no = ? LIMIT 1',
      [mobile_no]
    )

    const users = rows as { role: string }[]
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    return res.status(200).json({ role: users[0].role })
  } catch (error) {
    console.error('MySQL error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
