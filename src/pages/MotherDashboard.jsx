import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, LogOut, FileText, AlertCircle, TrendingUp, Calendar, Plus, ChievronDown } from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import api from '../services/api';
import toast from 'react-hot-toast';
import './DashboardPages.css';

const MotherDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dashboard, setDashboard] = useState({
    risk_level: 'LOW',
    risk_score: 0,
    weeks_pregnant: 0,
    next_appointment: null,
    symptoms_this_week: 0,
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await api.get('/mother/dashboard');
      setDashboard(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'HIGH':
        return 'danger';
      case 'MODERATE':
        return 'warning';
      case 'LOW':
      default:
        return 'success';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="dashboard-page">
      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="user-avatar">
            {user?.full_name?.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <h4>{user?.full_name}</h4>
            <p>Mother</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <a href="#dashboard" className="nav-item active">
            <Heart size={20} />
            Dashboard
          </a>
          <a href="#symptoms" onClick={() => navigate('/symptoms')} className="nav-item">
            <AlertCircle size={20} />
            Log Symptoms
          </a>
          <a href="#results" onClick={() => navigate('/risk-result')} className="nav-item">
            <FileText size={20} />
            My Risk Results
          </a>
          <a href="#appointments" className="nav-item">
            <Calendar size={20} />
            Appointments
          </a>
        </nav>

        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-header">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <h1>Welcome, {user?.full_name?.split(' ')[0]}</h1>
          <p className="header-subtitle">Your maternal health at a glance</p>
        </div>

        <div className="dashboard-content fade-in">
          {/* Key Stats */}
          <section className="stats-section">
            <h2 className="section-title">Your Health Status</h2>
            <div className="stats-grid">
              <StatCard
                icon={AlertCircle}
                label="Risk Level"
                value={dashboard.risk_level}
                color={getRiskColor(dashboard.risk_level)}
                loading={loading}
                trend={`Score: ${dashboard.risk_score}/100`}
              />
              <StatCard
                icon={Calendar}
                label="Weeks Pregnant"
                value={`${dashboard.weeks_pregnant} weeks`}
                color="primary"
                loading={loading}
              />
              <StatCard
                icon={TrendingUp}
                label="This Week"
                value={`${dashboard.symptoms_this_week} symptoms logged`}
                color="primary"
                loading={loading}
              />
              <StatCard
                icon={Calendar}
                label="Next Appointment"
                value={dashboard.next_appointment || 'Not scheduled'}
                color="primary"
                loading={loading}
              />
            </div>
          </section>

          {/* Quick Actions */}
          <section className="quick-actions-section">
            <h2 className="section-title">Quick Actions</h2>
            <div className="actions-grid">
              <button
                className="action-card"
                onClick={() => navigate('/symptoms')}
              >
                <Plus size={28} />
                <span>Log Symptoms Today</span>
              </button>
              <button
                className="action-card"
                onClick={() => navigate('/risk-result')}
              >
                <FileText size={28} />
                <span>View Risk Report</span>
              </button>
              <button className="action-card">
                <Heart size={28} />
                <span>Message CHV</span>
              </button>
            </div>
          </section>

          {/* Recent Activity */}
          <section className="activity-section">
            <h2 className="section-title">Recent Activity</h2>
            <div className="glass-card activity-card">
              <p className="placeholder-text">No recent activity yet. Start by logging your symptoms!</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default MotherDashboard;
