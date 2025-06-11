import { useEffect, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import styles from '../styles/AdminJobList.module.css'

interface Job {
  id: number
  job_id: string
  client_name: string
  job_received_date: string
  mode_received: string
  job_description: string
  status: string
  invoice_raised: boolean
  is_delivered: boolean
  payment_received: boolean
  invoice_amount?: number
}

export default function AdminJobList() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await axios.get('/api/jobs/all')
        setJobs(res.data)
      } catch (err) {
        console.error('Failed to fetch jobs', err)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  if (loading)
    return <div className={styles.loadingContainer}>Loading jobs...</div>

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Admin - All Jobs</h1>

      {/* Scrollable wrapper */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.theadRow}>
              <th className={styles.th}>Job Received</th>
              <th className={styles.th}>Job ID</th>
              <th className={styles.th}>Client</th>
              <th className={styles.th}>Mode</th>
              <th className={styles.th}>Description</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>Invoice Raised</th>
              <th className={styles.th}>Invoice Amount</th>
              <th className={styles.th}>Payment Received</th>
              <th className={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 && (
              <tr>
                <td colSpan={10} className={styles.emptyRow}>
                  No jobs found.
                </td>
              </tr>
            )}
            {jobs.map((job) => (
              <tr key={job.id} className={styles.tbodyRow}>
                <td className={styles.td}>
                  {new Date(job.job_received_date).toLocaleDateString()}
                </td>
                <td className={styles.td}>{job.job_id}</td>
                <td className={styles.td}>{job.client_name}</td>
                <td className={styles.td}>{job.mode_received}</td>

                <td className={styles.td}>
                  <span title={job.job_description}>
                    {job.job_description.length > 40
                      ? job.job_description.slice(0, 40) + '...'
                      : job.job_description}
                  </span>
                </td>

                <td className={styles.td}>{job.status}</td>
                <td className={styles.td}>{job.invoice_raised ? 'Yes' : 'No'}</td>
                <td className={styles.td}>
                  {job.invoice_amount ? `₹${job.invoice_amount}` : 'No'}
                </td>
                <td className={styles.td}>
                  {job.payment_received && job.invoice_amount
                    ? `₹${job.invoice_amount}`
                    : 'No'}
                </td>
                <td className={styles.td}>
                  <Link href={`/admin/jobs/${job.id}`} legacyBehavior>
                    <a className={styles.editLink}>Edit</a>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
