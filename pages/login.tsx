import React, { useState } from 'react'
import { useRouter } from 'next/router'

const LoginPage = () => {
  const router = useRouter()
  const [mobileNo, setMobileNo] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!mobileNo) {
      setError('Please enter mobile number')
      return
    }

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile_no: mobileNo }),
      })
      if (!res.ok) {
        const errData = await res.json()
        setError(errData.message || 'Login failed')
        return
      }

      const data = await res.json()
      if (data.role === 'user') {
        router.push('/user/user-dashboard')
      } else if (data.role === 'admin') {
        router.push('/admin/admin-dashboard')
      } else {
        setError('Unknown user role')
      }
    } catch (err) {
      setError('Server error, try again later')
    }
  }

  return (
    <div style={{
      maxWidth: '400px',
      margin: '4rem auto',
      padding: '2rem',
      border: '1px solid #ccc',
      borderRadius: '10px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      fontFamily: 'Arial, sans-serif',
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#333' }}>Login</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="mobile_no" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Mobile Number
        </label>
        <input
          id="mobile_no"
          type="tel"
          value={mobileNo}
          onChange={(e) => setMobileNo(e.target.value)}
          placeholder="Enter mobile number"
          style={{
            width: '95%',
            padding: '0.6rem',
            fontSize: '1rem',
            marginBottom: '1rem',
            borderRadius: '5px',
            border: '1px solid #ccc',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = '#0070f3'}
          onBlur={(e) => e.currentTarget.style.borderColor = '#ccc'}
          required
        />
        {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
        <button type="submit" style={{
          width: '100%',
          padding: '0.75rem',
          fontSize: '1rem',
          fontWeight: 'bold',
          backgroundColor: '#0070f3',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          transition: 'background-color 0.3s',
        }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#005bb5'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0070f3'}
        >
          Login
        </button>
      </form>
    </div>
  )
}

export default LoginPage
