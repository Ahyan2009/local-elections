import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
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

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/landingpage" element={<LandingPage />} />
        <Route path="/verify-otp" element={<OtpVerification />} />
        <Route path="/register-candidate" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/candidates" element={<PublicCandidates />} />
        <Route path="/admin/requests" element={<AdminRequests />} />
        <Route path="/admin/candidates" element={<Candidates />} />
        <Route path="/admin/candidates/:id" element={<CandidateDetails />} />
        <Route path="/admin/candidate-details" element={<CandidateDetails />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  )
}

export default App
