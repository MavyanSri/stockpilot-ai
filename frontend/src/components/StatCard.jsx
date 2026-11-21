import React from 'react';
import { Icon } from './Icons';

export const StatCard = ({ title, value, subtitle, icon, color = 'blue', trend = null }) => {
  return (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-header">
        <span className="stat-title">{title}</span>
        <div className={`stat-icon-wrapper icon-bg-${color}`}>
          <Icon name={icon} size={20} />
        </div>
      </div>
      <div className="stat-value">{value}</div>
      {(subtitle || trend) && (
        <div className="stat-footer">
          {trend && (
            <span className={`stat-trend ${trend.type}`}>
              {trend.value}
            </span>
          )}
          {subtitle && <span className="stat-subtitle">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
