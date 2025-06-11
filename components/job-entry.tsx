import React, { useState, useEffect } from 'react'
import styles from '../styles/JobEntryForm.module.css'

interface Employee {
  id: number
  name: string
}

interface Code {
  item: string
  hsn_code: string
}

const JobEntryForm = () => {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [codes, setCodes] = useState<Code[]>([]) // ✅ New state
  const [loadingEmployees, setLoadingEmployees] = useState(true)
  const [loadingCodes, setLoadingCodes] = useState(true)

  const todayDate = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    job_received_date: todayDate,
    mode_received: 'Email',
    job_description: '',
    type_of_job: '', // ✅ New field
    assigned_to: '',
    target_completion_date: '',
  })

  useEffect(() => {
    async function fetchEmployees() {
      try {
        const res = await fetch('/api/users')
        if (!res.ok) throw new Error('Failed to fetch employees')
        const data: Employee[] = await res.json()
        setEmployees(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoadingEmployees(false)
      }
    }

    async function fetchCodes() {
      try {
        const res = await fetch('/api/codes')
        const data: Code[] = await res.json()
        setCodes(data)
      } catch (error) {
        console.error('Error fetching codes:', error)
      } finally {
        setLoadingCodes(false)
      }
    }

    fetchEmployees()
    fetchCodes()
  }, [])

  const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
) => {
  const { name, value } = e.target
  console.log('Field:', name, 'Value:', value)  // ✅ Add this
  setForm({ ...form, [name]: value })
}

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Submitting form:', form)
    try {
      await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          assigned_to: parseInt(form.assigned_to, 10),
        }),
      })
      alert('Job created successfully!')
      setForm({
        client_name: '',
        client_email: '',
        client_phone: '',
        job_received_date: todayDate,
        mode_received: 'Email',
        job_description: '',
        type_of_job: '',
        assigned_to: '',
        target_completion_date: '',
      })
    } catch (err) {
      console.error('Error creating job', err)
      alert('Failed to create job')
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>New Job Entry</h1>
      <form onSubmit={handleSubmit}>
        <label className={styles.label}>Client Name</label>
        <input
          type="text"
          name="client_name"
          value={form.client_name}
          onChange={handleChange}
          required
          className={styles.input}
        />

        <label className={styles.label}>Client Email</label>
        <input
          type="email"
          name="client_email"
          value={form.client_email}
          onChange={handleChange}
          required
          className={styles.input}
        />

        <label className={styles.label}>Client Phone</label>
        <input
          type="tel"
          name="client_phone"
          value={form.client_phone}
          onChange={handleChange}
          required
          className={styles.input}
        />

        <label className={styles.label}>Job Received Date</label>
        <input
          type="date"
          name="job_received_date"
          value={form.job_received_date}
          onChange={handleChange}
          required
          className={styles.input}
        />

        <label className={styles.label}>Mode Received</label>
        <select
          name="mode_received"
          value={form.mode_received}
          onChange={handleChange}
          required
          className={styles.select}
        >
          <option value="Email">Email</option>
          <option value="Phone">Phone</option>
          <option value="WhatsApp">WhatsApp</option>
          <option value="Physical Documents">Physical Documents</option>
          <option value="Other">Other</option>
        </select>

        <label className={styles.label}>Job Description</label>
        <textarea
          name="job_description"
          value={form.job_description}
          onChange={handleChange}
          required
          className={styles.textarea}
        />

        {/* ✅ Type of Job Dropdown */}
        <label className={styles.label}>Type of Job</label>
        <select
          name="type_of_job"
          value={form.type_of_job}
          onChange={handleChange}
          required
          className={styles.select}
          disabled={loadingCodes}
        >
          <option value="">
            {loadingCodes ? 'Loading...' : 'Select Type of Job'}
          </option>
          {codes.map((code, index) => (
            <option key={index} value={`${code.item} (${code.hsn_code})`}>
            {code.item} ({code.hsn_code})
          </option>
          ))}
        </select>

        <label className={styles.label}>Assign to</label>
        <select
          name="assigned_to"
          value={form.assigned_to}
          onChange={handleChange}
          required
          className={styles.select}
          disabled={loadingEmployees}
        >
          <option value="">
            {loadingEmployees ? 'Loading employees...' : 'Select Employee'}
          </option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id.toString()}>
              {emp.name}
            </option>
          ))}
        </select>

        <label className={styles.label}>Target Completion Date</label>
        <input
          type="date"
          name="target_completion_date"
          value={form.target_completion_date}
          onChange={handleChange}
          required
          className={styles.input}
        />

        <button type="submit" className={styles.button}>
          Create Job
        </button>
      </form>
    </div>
  )
}

export default JobEntryForm
