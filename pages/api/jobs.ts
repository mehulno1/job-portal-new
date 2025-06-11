// File: pages/api/jobs.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import mysql from 'mysql2/promise'

// Create MySQL connection pool
const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',          // change if needed
  password: '',          // change if needed
  database: 'job_portal', // your actual DB name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// Helper function to generate unique job_id like DC-101, DC-102, etc.
async function generateJobId() {
  const [rows] = await pool.query('SELECT MAX(id) AS maxId FROM job')
  const maxId = (rows as any)[0]?.maxId || 0
  return `DC-${100 + maxId + 1}`
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ message: `Method ${req.method} not allowed` })
  }

  const {
    client_name,
    client_email,
    client_phone,
    mode_received,
    job_description,
    type_of_job,
    assigned_to,
    target_completion_date,
    job_received_date,  // <--- NEW FIELD added here
  } = req.body

  try {
    const job_id = await generateJobId()

    const [result] = await pool.query(
      `INSERT INTO job 
      (job_id, client_name, client_email, client_phone, mode_received, job_description, type_of_job, assigned_to, target_completion_date, job_received_date, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        job_id,
        client_name,
        client_email,
        client_phone,
        mode_received,
        job_description,
        type_of_job,
        assigned_to,
        target_completion_date,
        job_received_date,  // <--- included in query params
      ]
    )

    res.status(200).json({ message: 'Job created successfully', job_id })
  } catch (error) {
    console.error('Database insertion error:', error)
    res.status(500).json({ error: 'Failed to create job' })
  }
}
