import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Signup from './pages/Signup';
import Login from './pages/Login';
import MotherDashboard from './pages/MotherDashboard';
import SymptomsPage from './pages/SymptomsPage';
import RiskResult from './pages/RiskResult';
import CHVDashboard from './pages/CHVDashboard';

// Styles
import './styles/globals.css';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/mother-dashboard"
            element={
              <ProtectedRoute role="mother">
                <MotherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/symptoms"
            element={
              <ProtectedRoute role="mother">
                <SymptomsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/risk-result"
            element={
              <ProtectedRoute>
                <RiskResult />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chv-dashboard"
            element={
              <ProtectedRoute role="chv">
                <CHVDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#333',
            },
            success: {
              duration: 3000,
              style: {
                background: '#f0fdf4',
                color: '#16a34a',
                border: '1px solid #bbf7d0',
              },
              iconTheme: {
                primary: '#16a34a',
                secondary: '#f0fdf4',
              },
            },
            error: {
              duration: 4000,
              style: {
                background: '#fef2f2',
                color: '#dc2626',
                border: '1px solid #fecaca',
              },
              iconTheme: {
                primary: '#dc2626',
                secondary: '#fef2f2',
              },
            },
          }}
        />
      </AuthProvider>
    </Router>
  );
}

export default App;
