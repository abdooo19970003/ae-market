import ProtectedRoute from '@/lib/auth/ProtectedRoute'
import DashboardClient from './DashboardClient'

const Dashboard = async () => {
  return (
    <ProtectedRoute>
      <DashboardClient />
    </ProtectedRoute>
  )
}

export default Dashboard
