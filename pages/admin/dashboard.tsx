import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function AdminDashboard() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/admin/jobs')
  }, [router])

  return <p>Loading admin dashboard...</p>
}
