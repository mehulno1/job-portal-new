// pages/admin/admin-dashboard.tsx
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { useRouter } from 'next/router'
import styles from '../styles/AdminJobList.module.css'
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


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
  type_of_job?: string // ✅ Ensure this is available
}

const AdminDashboard = () => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

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

  const handleLogout = () => {
    router.push('/login')
  }
const exportToExcel = () => {
  if (!jobs || jobs.length === 0) {
    alert('No data to export');
    return;
  }

  // Optional: Map only selected fields
  const exportData = jobs.map(job => ({
    'Job ID': job.job_id,
    'Client Name': job.client_name,
    'Received Date': new Date(job.job_received_date).toLocaleDateString(),
    'Mode': job.mode_received,
    'Description': job.job_description,
    'Type of Job': job.type_of_job,
    'Status': job.status,
    'Invoice Raised': job.invoice_raised ? 'Yes' : 'No',
    'Invoice Amount': job.invoice_amount ? `₹${job.invoice_amount}` : 'No',
    'Payment Received': job.payment_received && job.invoice_amount ? `₹${job.invoice_amount}` : 'No',
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Jobs');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const fileName = `jobs_${new Date().toISOString().slice(0, 10)}.xlsx`;
  const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(data, fileName);
};

  if (loading)
    return <div className={styles.loadingContainer}>Loading jobs...</div>

  return (
    <div className={styles.container} style={{ position: 'relative' }}>
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

      <div style={{ marginBottom: '15px' }}>
        <Link href="/user/job-entry" legacyBehavior>
          <a className={styles.createJobLink}>Create New Job</a>
        </Link>
      </div>
      <h1 className={styles.heading}>Admin - All Jobs</h1>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.theadRow}>
              <th className={styles.th}>Job Received</th>
              <th className={styles.th}>Job ID</th>
              <th className={styles.th}>Client</th>
              <th className={styles.th}>Mode</th>
              <th className={styles.th}>Description</th>
              <th className={styles.th}>Type of Job</th> {/* ✅ New Column */}
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
                <td colSpan={11} className={styles.emptyRow}>
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

                <td className={styles.td}>
                <span title={job.type_of_job}>
                {job.type_of_job && job.type_of_job.length > 40
                ? job.type_of_job.slice(0, 40) + '...'
                : job.type_of_job || 'N/A'}
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
    <div className={styles.buttonWrapper}>
    <button onClick={exportToExcel} className={styles.exportButton}>
    Export to Excel
    </button>
    </div>
    </div>
    
  )
}

export default AdminDashboard
