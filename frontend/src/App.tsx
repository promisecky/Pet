import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import PetProfile from './pages/PetProfile'
import HealthPlan from './pages/HealthPlan'
import DeviceControl from './pages/DeviceControl'
import Login from './pages/Login'
import { useStore } from './store'

function App() {
  const user = useStore(state => state.user)

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" replace />} />
          <Route path="/pets" element={user ? <PetProfile /> : <Navigate to="/login" replace />} />
          <Route path="/plans" element={user ? <HealthPlan /> : <Navigate to="/login" replace />} />
          <Route path="/devices" element={user ? <DeviceControl /> : <Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
