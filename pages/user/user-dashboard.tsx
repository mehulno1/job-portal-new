// pages/user/user-dashboard.tsx
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styles from '../styles/AdminJobList.module.css' // Reusing admin styles

interface Job {
  id: number
  job_id: string
  client_name: string
  job_received_date: string
  mode_received: string
  job_description: string
  status: string
}

const UserDashboard: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch('/api/jobs/all')  // Or axios.get if preferred
        const data = await res.json()
        setJobs(data)
      } catch (error) {
        console.error('Failed to fetch jobs', error)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  const handleLogout = () => {
    // Add any session cleanup here if needed (e.g., localStorage.clear())
    router.push('/login')
  }

  if (loading) {
    return <div className={styles.loadingContainer}>Loading jobs...</div>
  }

  return (
    <div className={styles.container} style={{ position: 'relative' }}>
      {/* Logout button */}
      <button
        onClick={handleLogout}
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          padding: '0.5rem 1rem',
          backgroundColor: '#e53e3e',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          zIndex: 1000,
        }}
      >
        Logout
      </button>

      {/* Create New Job link */}
      <div style={{ marginBottom: '15px' }}>
        <Link href="/user/job-entry" legacyBehavior>
          <a className={styles.createJobLink}>Create New Job</a>
        </Link>
      </div>

      <h1 className={styles.heading}>User Dashboard</h1>

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
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.emptyRow}>
                  No jobs found.
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr key={job.id} className={styles.tbodyRow}>
                  <td className={styles.td}>
                    {new Date(job.job_received_date).toLocaleDateString()}
                  </td>
                  <td className={styles.td}>{job.job_id}</td>
                  <td className={styles.td}>{job.client_name}</td>
                  <td className={styles.td}>{job.mode_received}</td>
                  <td className={styles.td} title={job.job_description}>
                    {job.job_description.length > 40
                      ? job.job_description.slice(0, 40) + '...'
                      : job.job_description}
                  </td>
                  <td className={styles.td}>{job.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default UserDashboard
