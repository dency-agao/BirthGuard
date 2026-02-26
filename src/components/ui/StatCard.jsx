import React from 'react';
import './StatCard.css';

const StatCard = ({ icon: Icon, label, value, color = 'primary', trend, loading = false }) => {
  return (
    <div className={`stat-card stat-card-${color}`}>
      {loading ? (
        <div className="stat-skeleton">
          <div className="skeleton-icon"></div>
          <div className="skeleton-content">
            <div className="skeleton-line" style={{ width: '80%' }}></div>
            <div className="skeleton-line" style={{ width: '100%' }}></div>
          </div>
        </div>
      ) : (
        <>
          {Icon && (
            <div className={`stat-icon stat-icon-${color}`}>
              <Icon size={28} />
            </div>
          )}
          <div className="stat-content">
            <p className="stat-label">{label}</p>
            <p className="stat-value">{value}</p>
            {trend && <p className="stat-trend">{trend}</p>}
          </div>
        </>
      )}
    </div>
  );
};

export default StatCard;
