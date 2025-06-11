import type { NextApiRequest, NextApiResponse } from 'next'
import mysql from 'mysql2/promise'

// Set up MySQL connection pool (same as your all jobs API)
const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',            // Your MySQL username
  password: '',            // Your MySQL password
  database: 'job_portal',  // Your database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Only PUT requests are allowed' })
  }

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ message: 'Invalid job ID' })
  }

  const {
    invoice_raised,
    is_delivered,
    invoice_number,
    invoice_amount,
    payment_received,
    payment_mode,
    payment_reference,
  } = req.body

  try {
    const [result] = await pool.query(
      `UPDATE job SET
        invoice_raised = ?,
        is_delivered = ?,
        invoice_number = ?,
        invoice_amount = ?,
        payment_received = ?,
        payment_mode = ?,
        payment_reference = ?,
        updated_at = CURRENT_TIMESTAMP(3)
      WHERE id = ?`,
      [
        invoice_raised ? 1 : 0,
        is_delivered ? 1 : 0,
        invoice_number || null,
        invoice_amount || null,
        payment_received ? 1 : 0,
        payment_mode || null,
        payment_reference || null,
        id,
      ]
    )

    return res.status(200).json({ message: 'Job updated successfully' })
  } catch (error) {
    console.error('Error updating job:', error)
    return res.status(500).json({ message: 'Failed to update job', error })
  }
}
