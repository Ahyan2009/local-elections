import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import OtpVerification from './pages/OtpVerification'
import Register from './pages/Register'
import Login from './pages/Login'
import AdminRequests from './pages/AdminRequests'
import Candidates from './pages/Candidates'
import CandidateDetails from './pages/CandidateDetails'
import AdminDashboard from './pages/AdminDashboard'
import LandingPage from './pages/LandingPage'
import PublicCandidates from './pages/PublicCandidates'

const AppShell = () => {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  return (
    <>
      {!isAdmin && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/landingpage" element={<LandingPage />} />
        <Route path="/verify-otp" element={<OtpVerification />} />
        <Route path="/register-candidate" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/candidates" element={<PublicCandidates />} />

        <Route path="/admin/requests" element={<ProtectedRoute><AdminRequests /></ProtectedRoute>} />
        <Route path="/admin/candidates" element={<ProtectedRoute><Candidates /></ProtectedRoute>} />
        <Route path="/admin/candidates/:id" element={<ProtectedRoute><CandidateDetails /></ProtectedRoute>} />
        <Route path="/admin/candidate-details" element={<ProtectedRoute><CandidateDetails /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </>
  )
}

const App = () => {
  return (
    <Router>
      <AppShell />
    </Router>
  )
}

export default App
