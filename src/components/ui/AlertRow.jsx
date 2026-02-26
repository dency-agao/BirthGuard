import React from 'react';
import { AlertCircle, Phone, CheckCircle } from 'lucide-react';
import './AlertRow.css';

const AlertRow = ({ alert, onCall, onRefer, onMarkReviewed, loading = false }) => {
  const getRiskColor = (level) => {
    switch (level) {
      case 'HIGH':
        return '#E63946';
      case 'MODERATE':
        return '#F4A261';
      case 'LOW':
        return '#2DC653';
      default:
        return '#0077B6';
    }
  };

  const getRelativeTime = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="alert-row" style={{ borderLeft: `4px solid ${getRiskColor(alert.risk_level)}` }}>
      <div className="alert-header">
        <div className="alert-mother-info">
          <AlertCircle size={20} style={{ color: getRiskColor(alert.risk_level) }} />
          <div>
            <h4 className="alert-mother-name">{alert.mother_name}</h4>
            <p className="alert-time">{getRelativeTime(alert.created_at)}</p>
          </div>
        </div>
        <span className="alert-badge" style={{ backgroundColor: getRiskColor(alert.risk_level) + '20', color: getRiskColor(alert.risk_level) }}>
          {alert.risk_level} - Score: {alert.risk_score}
        </span>
      </div>

      <div className="alert-details">
        <p className="alert-symptom">
          <strong>Key Symptom:</strong> {alert.key_symptom || 'Not specified'}
        </p>
        {alert.notes && <p className="alert-notes"><strong>Notes:</strong> {alert.notes}</p>}
      </div>

      <div className="alert-actions">
        <button
          className="action-btn action-call"
          onClick={() => onCall && onCall(alert.id)}
          disabled={loading}
          title="Call mother"
        >
          <Phone size={16} />
          Call
        </button>
        <button
          className="action-btn action-refer"
          onClick={() => onRefer && onRefer(alert.id)}
          disabled={loading}
          title="Create referral"
        >
          Refer
        </button>
        <button
          className="action-btn action-mark"
          onClick={() => onMarkReviewed && onMarkReviewed(alert.id)}
          disabled={loading}
          title="Mark as reviewed"
        >
          <CheckCircle size={16} />
          Mark Reviewed
        </button>
      </div>
    </div>
  );
};

export default AlertRow;
