import React, { useState, useEffect } from 'react';
import { Download, Share2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import RiskGauge from '../components/ui/RiskGauge';
import './RiskResultPage.css';

const RiskResult = () => {
  const [loading, setLoading] = useState(true);
  const [riskData, setRiskData] = useState(null);

  useEffect(() => {
    fetchRiskResult();
  }, []);

  const fetchRiskResult = async () => {
    try {
      setLoading(true);
      const response = await api.get('/risk/latest');
      setRiskData(response.data);
    } catch (error) {
      console.error('Error fetching risk result:', error);
      toast.error('Failed to load risk result');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'HIGH':
        return '#E63946';
      case 'MODERATE':
        return '#F4A261';
      case 'LOW':
      default:
        return '#2DC653';
    }
  };

  const getRecommendations = (level) => {
    switch (level) {
      case 'HIGH':
        return 'URGENT: Seek medical attention immediately. Your CHV and facility have been alerted.';
      case 'MODERATE':
        return 'Visit your nearest health facility within 48 hours. Your CHV has been informed.';
      case 'LOW':
      default:
        return 'Continue regular antenatal visits. Stay hydrated and rest well.';
    }
  };

  if (loading) {
    return (
      <div className="risk-result-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your risk assessment...</p>
        </div>
      </div>
    );
  }

  if (!riskData) {
    return (
      <div className="risk-result-page">
        <div className="no-data-container">
          <p>No risk assessment found. Please log your symptoms first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="risk-result-page">
      <div className="result-container">
        {/* Risk Gauge */}
        <section className="result-section fade-in">
          <div className="gauge-section">
            <RiskGauge score={riskData.risk_score} animated={false} />
          </div>
        </section>

        {/* Recommendation */}
        <section className="result-section slide-in-up">
          <div className="recommendation-card" style={{ borderLeft: `4px solid ${getRiskColor(riskData.risk_level)}` }}>
            <h2>Health Recommendation</h2>
            <p className="recommendation-text">{getRecommendations(riskData.risk_level)}</p>
          </div>
        </section>

        {/* Alert Status */}
        <section className="result-section slide-in-up">
          <div className="alert-status-card">
            <h3>Alert Status</h3>
            <div className="status-item">
              <span className="status-label">CHV Notification:</span>
              <span className="status-badge notified">✅ Notified</span>
            </div>
            <div className="status-item">
              <span className="status-label">Notification Time:</span>
              <span className="status-time">{new Date(riskData.created_at).toLocaleString()}</span>
            </div>
          </div>
        </section>

        {/* Risk Breakdown */}
        {riskData.symptoms && riskData.symptoms.length > 0 && (
          <section className="result-section slide-in-up">
            <h3>Contributing Factors</h3>
            <div className="breakdown-table">
              <div className="breakdown-header">
                <div className="breakdown-col">Symptom</div>
                <div className="breakdown-col">Severity</div>
                <div className="breakdown-col">Weight</div>
              </div>
              {riskData.symptoms.map((symptom, idx) => (
                <div key={idx} className="breakdown-row">
                  <div className="breakdown-col">{symptom.name.replace(/_/g, ' ')}</div>
                  <div className="breakdown-col">
                    <div className="severity-bar">
                      <div
                        className="severity-fill"
                        style={{ width: `${(symptom.severity / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="breakdown-col">{symptom.severity}/5</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* History */}
        <section className="result-section slide-in-up">
          <h3>Recent Risk Assessments</h3>
          <div className="history-list">
            <div className="history-item">
              <span className="history-date">{new Date(riskData.created_at).toLocaleDateString()}</span>
              <span className="history-score" style={{ color: getRiskColor(riskData.risk_level) }}>
                {riskData.risk_score}
              </span>
              <span className="history-level">{riskData.risk_level}</span>
            </div>
          </div>
        </section>

        {/* Actions */}
        <section className="result-section slide-in-up">
          <div className="action-buttons">
            <button className="btn btn-primary btn-lg">
              <Download size={18} />
              Download Report
            </button>
            <button className="btn btn-secondary btn-lg">
              <Share2 size={18} />
              Share with CHV
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default RiskResult;
