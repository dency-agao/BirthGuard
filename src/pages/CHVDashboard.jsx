import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, LogOut, Users, TrendingUp, FileText, Bell } from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import AlertRow from '../components/ui/AlertRow';
import api from '../services/api';
import toast from 'react-hot-toast';
import './DashboardPages.css';

const CHVDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboard, setDashboard] = useState({
    total_mothers: 0,
    high_risk_cases: 0,
    unread_alerts: 0,
    referrals_this_month: 0,
  });
  const [alerts, setAlerts] = useState([]);
  const [mothers, setMothers] = useState([]);

  useEffect(() => {
    fetchDashboard();
    if (activeTab === 'alerts') {
      fetchAlerts();
    } else if (activeTab === 'mothers') {
      fetchMothers();
    }
  }, [activeTab]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await api.get('/chv/dashboard');
      setDashboard(response.data);
    } catch (error) {
      console.error('Error fetching CHV dashboard:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await api.get('/chv/alerts');
      setAlerts(response.data.alerts || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast.error('Failed to load alerts');
    }
  };

  const fetchMothers = async () => {
    try {
      const response = await api.get('/chv/mothers');
      setMothers(response.data.mothers || []);
    } catch (error) {
      console.error('Error fetching mothers:', error);
      toast.error('Failed to load mothers list');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleMarkReviewed = async (alertId) => {
    try {
      await api.put(`/chv/alerts/${alertId}/mark-reviewed`);
      toast.success('Alert marked as reviewed');
      fetchAlerts();
    } catch (error) {
      toast.error('Failed to update alert');
    }
  };

  const handleRefer = async (motherId) => {
    const facility = prompt('Enter facility name for referral:');
    if (facility) {
      try {
        await api.post('/referrals/create', {
          mother_id: motherId,
          facility,
          urgency: 'high',
          notes: 'Automated referral from CHV dashboard',
        });
        toast.success('Referral created successfully');
        fetchAlerts();
      } catch (error) {
        toast.error('Failed to create referral');
      }
    }
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
            <p>CHV</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <a 
            href="#dashboard" 
            onClick={() => setActiveTab('dashboard')} 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            <TrendingUp size={20} />
            Dashboard
          </a>
          <a 
            href="#alerts" 
            onClick={() => setActiveTab('alerts')} 
            className={`nav-item ${activeTab === 'alerts' ? 'active' : ''}`}
          >
            <Bell size={20} />
            High-Risk Alerts
          </a>
          <a 
            href="#mothers" 
            onClick={() => setActiveTab('mothers')} 
            className={`nav-item ${activeTab === 'mothers' ? 'active' : ''}`}
          >
            <Users size={20} />
            All Mothers
          </a>
          <a href="#referrals" className="nav-item">
            <FileText size={20} />
            Referrals
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
          <h1>CHV Dashboard</h1>
          <p className="header-subtitle">Monitor assigned mothers and manage alerts</p>
        </div>

        <div className="dashboard-content fade-in">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <>
              <section className="stats-section">
                <h2 className="section-title">Overview</h2>
                <div className="stats-grid">
                  <StatCard
                    icon={Users}
                    label="Total Mothers"
                    value={dashboard.total_mothers}
                    color="primary"
                    loading={loading}
                  />
                  <StatCard
                    icon={AlertCircle}
                    label="High-Risk Cases"
                    value={dashboard.high_risk_cases}
                    color="danger"
                    loading={loading}
                  />
                  <StatCard
                    icon={Bell}
                    label="Unread Alerts"
                    value={dashboard.unread_alerts}
                    color="warning"
                    loading={loading}
                  />
                  <StatCard
                    icon={FileText}
                    label="Referrals This Month"
                    value={dashboard.referrals_this_month}
                    color="success"
                    loading={loading}
                  />
                </div>
              </section>

              <section className="activity-section">
                <h2 className="section-title">Recent Activity</h2>
                <div className="glass-card activity-card">
                  <p className="placeholder-text">No recent activity. High-risk alerts will appear here.</p>
                </div>
              </section>
            </>
          )}

          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <section className="activity-section">
              <h2 className="section-title">
                High-Risk Alerts
                {alerts.length > 0 && (
                  <span className="alert-badge" style={{ marginLeft: 'auto', fontSize: '0.85rem' }}>
                    {alerts.length} cases
                  </span>
                )}
              </h2>
              <div className="alerts-container">
                {alerts.length > 0 ? (
                  alerts.map((alert) => (
                    <AlertRow
                      key={alert.id}
                      alert={alert}
                      onMarkReviewed={() => handleMarkReviewed(alert.id)}
                      onRefer={() => handleRefer(alert.mother_id)}
                    />
                  ))
                ) : (
                  <div className="glass-card activity-card">
                    <p className="placeholder-text">No high-risk alerts at the moment. All mothers are doing well!</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Mothers Tab */}
          {activeTab === 'mothers' && (
            <section className="mothers-table-section">
              <h2 className="section-title">All Assigned Mothers</h2>
              <div className="glass-card">
                <div className="mothers-table">
                  <div className="table-header">
                    <div className="table-col">Name</div>
                    <div className="table-col">Phone</div>
                    <div className="table-col">Weeks Pregnant</div>
                    <div className="table-col">Risk Level</div>
                    <div className="table-col">Actions</div>
                  </div>
                  {mothers.length > 0 ? (
                    mothers.map((mother) => (
                      <div key={mother.id} className="table-row">
                        <div className="table-col">{mother.full_name}</div>
                        <div className="table-col">{mother.phone}</div>
                        <div className="table-col">{mother.weeks_pregnant || '-'}</div>
                        <div className="table-col">
                          <span
                            className="risk-badge"
                            style={{
                              backgroundColor:
                                mother.risk_level === 'HIGH'
                                  ? 'rgba(230, 57, 70, 0.15)'
                                  : mother.risk_level === 'MODERATE'
                                  ? 'rgba(244, 162, 97, 0.15)'
                                  : 'rgba(45, 198, 83, 0.15)',
                              color:
                                mother.risk_level === 'HIGH'
                                  ? '#E63946'
                                  : mother.risk_level === 'MODERATE'
                                  ? '#F4A261'
                                  : '#2DC653',
                            }}
                          >
                            {mother.risk_level}
                          </span>
                        </div>
                        <div className="table-col actions">
                          <button className="action-link">Call</button>
                          <button className="action-link" onClick={() => handleRefer(mother.id)}>
                            Refer
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div
                      style={{
                        padding: '2rem',
                        textAlign: 'center',
                        color: 'var(--text-mid)',
                      }}
                    >
                      No mothers assigned yet.
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default CHVDashboard;
